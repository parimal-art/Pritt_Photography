import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models";
import { handle, json, requireAdmin, clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

/** Clears the cookie and bumps tokenVersion, which invalidates every JWT issued so far. */
export const POST = handle(async (request) => {
  const admin = await requireAdmin(request);
  await connectDB();
  await Admin.updateOne({ _id: admin.id }, { $inc: { tokenVersion: 1 } });
  const response = json({ ok: true });
  clearSessionCookie(response);
  return response;
});
