import { handle, json, requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";

export const GET = handle(async (request) => {
  const admin = await requireAdmin(request);
  return json({ ok: true, admin: { email: admin.email } });
});
