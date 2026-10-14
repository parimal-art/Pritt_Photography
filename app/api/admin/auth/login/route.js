import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models";
import { signToken } from "@/lib/auth/jwt";
import { rateLimited, clientIp } from "@/lib/auth/rate-limit";
import { handle, json, readJson, setSessionCookie, HttpError, assertSameOrigin } from "@/lib/auth/session";

export const runtime = "nodejs";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
let dummyHash; // compared when the e-mail is unknown, so timing does not reveal valid accounts

export const POST = handle(async (request) => {
  assertSameOrigin(request);

  if (rateLimited(`login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  const body = await readJson(request);
  const email = String(body?.email || "").trim().toLowerCase().slice(0, 200);
  const password = String(body?.password || "").slice(0, 200);
  if (!email || !password) throw new HttpError(400, "Enter your email and password.");

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("[login] JWT_SECRET is missing or too short.");
    throw new HttpError(500, "The server is not configured for sign-in yet.");
  }

  await connectDB();
  const admin = await Admin.findOne({ email });

  if (admin?.lockUntil && admin.lockUntil > new Date()) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  dummyHash ??= bcrypt.hashSync(randomBytes(12).toString("hex"), 12);
  const valid = await bcrypt.compare(password, admin?.passwordHash || dummyHash);

  if (!admin || !valid) {
    if (admin) {
      admin.failedLogins = (admin.failedLogins || 0) + 1;
      if (admin.failedLogins >= MAX_FAILS) {
        admin.lockUntil = new Date(Date.now() + LOCK_MS);
        admin.failedLogins = 0;
      }
      await admin.save();
    }
    throw new HttpError(401, "Incorrect email or password.");
  }

  admin.failedLogins = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = new Date();
  await admin.save();

  const token = await signToken({ sub: String(admin._id), email: admin.email, ver: admin.tokenVersion ?? 0 });
  const response = json({ ok: true });
  setSessionCookie(response, token);
  return response;
});
