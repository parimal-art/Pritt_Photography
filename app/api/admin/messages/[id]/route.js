import { connectDB } from "@/lib/db/connect";
import { Message } from "@/lib/db/models";
import { handle, json, readJson, requireAdmin, HttpError } from "@/lib/auth/session";
import { isObjectId } from "@/lib/validation";

export const runtime = "nodejs";

export const PATCH = handle(async (request, { params }) => {
  await requireAdmin(request);
  const { id } = await params;
  if (!isObjectId(id)) throw new HttpError(404, "Not found.");
  const body = await readJson(request);
  await connectDB();
  const doc = await Message.findByIdAndUpdate(id, { $set: { read: body?.read === true } }, { new: true });
  if (!doc) throw new HttpError(404, "Not found.");
  return json({ ok: true });
});

export const DELETE = handle(async (request, { params }) => {
  await requireAdmin(request);
  const { id } = await params;
  if (!isObjectId(id)) throw new HttpError(404, "Not found.");
  await connectDB();
  await Message.findByIdAndDelete(id);
  return json({ ok: true });
});
