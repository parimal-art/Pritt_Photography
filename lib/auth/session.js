/**
 * Server-side session / authorization (Node runtime only).
 *
 * Two layers protect the admin area:
 *   1. middleware.js     — fast JWT signature + expiry check (Edge)
 *   2. this file         — authoritative check: valid JWT AND the admin still exists in
 *                          MongoDB AND the token's version matches (logout bumps it).
 *
 * Every admin Route Handler is wrapped in `handle()` and calls `requireAdmin()` first.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models";
import { COOKIE_NAME, SESSION_SECONDS, verifyToken } from "@/lib/auth/jwt";
import { ValidationError } from "@/lib/validation";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

async function adminFromPayload(payload) {
  if (!payload) return null;
  await connectDB();
  const admin = await Admin.findById(payload.sub).select("email tokenVersion").lean();
  if (!admin || (admin.tokenVersion ?? 0) !== (payload.ver ?? 0)) return null;
  return { id: String(admin._id), email: admin.email };
}

/** For Server Components: current admin or null. */
export async function getSession() {
  try {
    const store = await cookies();
    return await adminFromPayload(await verifyToken(store.get(COOKIE_NAME)?.value));
  } catch {
    return null;
  }
}

/** For protected pages: redirects to the login page when not signed in. */
export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin");
  return session;
}

/** CSRF defence for cookie auth: mutating requests must come from our own origin. */
export function assertSameOrigin(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  let ok = false;
  try {
    ok = Boolean(origin && host && new URL(origin).host === host);
  } catch {
    ok = false;
  }
  if (!ok) throw new HttpError(403, "Request blocked.");
}

/** For Route Handlers: throws HttpError(401) unless a valid admin session exists. */
export async function requireAdmin(request) {
  assertSameOrigin(request);
  const payload = await verifyToken(request.cookies.get(COOKIE_NAME)?.value);
  const admin = await adminFromPayload(payload);
  if (!admin) throw new HttpError(401, "Please sign in again.");
  return admin;
}

export function setSessionCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Wraps a Route Handler: maps known errors to safe JSON, hides internals. */
export function handle(fn) {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (err) {
      if (err instanceof HttpError) return json({ ok: false, message: err.message }, err.status);
      if (err instanceof ValidationError) return json({ ok: false, message: err.message, errors: err.errors }, 422);
      if (err?.code === 11000) return json({ ok: false, message: "That value is already in use." }, 409);
      if (err?.name === "CastError") return json({ ok: false, message: "Not found." }, 404);
      console.error("[admin api]", request.method, request.nextUrl?.pathname, err);
      return json({ ok: false, message: "Something went wrong. Please try again." }, 500);
    }
  };
}

/** Parses a JSON body or throws a 400. */
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Invalid request body.");
  }
}
