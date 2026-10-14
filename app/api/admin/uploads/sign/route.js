import { handle, json, readJson, requireAdmin } from "@/lib/auth/session";
import { signUpload } from "@/lib/cloudinary";

export const runtime = "nodejs";

/** POST { kind: "photo" | "site" } -> signed Cloudinary upload parameters (admin only). */
export const POST = handle(async (request) => {
  await requireAdmin(request);
  const body = await readJson(request);
  return json({ ok: true, ...signUpload(body?.kind === "site" ? "site" : "photo") });
});
