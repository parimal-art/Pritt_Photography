/**
 * Generic admin CRUD handler factories — used by categories, projects, services and
 * testimonials so each route file stays tiny and every endpoint is guarded the same way.
 *
 *   export const { GET, POST } = collectionHandlers({ model, rules });
 *   export const { PATCH, DELETE } = itemHandlers({ model, rules, beforeDelete });
 *   export const { POST } = reorderHandler({ model });
 */
import { connectDB } from "@/lib/db/connect";
import { plain, plainList } from "@/lib/db/serialize";
import { handle, json, readJson, requireAdmin, HttpError } from "@/lib/auth/session";
import { validateOrThrow, isObjectId } from "@/lib/validation";
import { revalidateContent } from "@/lib/admin/revalidate";

export function collectionHandlers({ model, rules, sort = { order: 1, createdAt: 1 }, prepare }) {
  const GET = handle(async (request) => {
    await requireAdmin(request);
    await connectDB();
    return json({ ok: true, items: plainList(await model.find().sort(sort).lean()) });
  });

  const POST = handle(async (request) => {
    await requireAdmin(request);
    const data = validateOrThrow(await readJson(request), rules);
    await connectDB();
    const last = await model.findOne().sort({ order: -1 }).select("order").lean();
    data.order = (last?.order ?? -1) + 1;
    if (prepare) await prepare(data, null);
    const doc = await model.create(data);
    revalidateContent();
    return json({ ok: true, item: plain(doc.toObject()) }, 201);
  });

  return { GET, POST };
}

export function itemHandlers({ model, rules, beforeDelete, afterDelete, afterSave, prepare }) {
  const PATCH = handle(async (request, { params }) => {
    await requireAdmin(request);
    const { id } = await params;
    if (!isObjectId(id)) throw new HttpError(404, "Not found.");
    const data = validateOrThrow(await readJson(request), rules, { partial: true });
    await connectDB();
    const current = await model.findById(id);
    if (!current) throw new HttpError(404, "Not found.");
    const before = current.toObject();
    if (prepare) await prepare(data, current);
    current.set(data);
    await current.save();
    if (afterSave) await afterSave(before, current);
    revalidateContent();
    return json({ ok: true, item: plain(current.toObject()) });
  });

  const DELETE = handle(async (request, { params }) => {
    await requireAdmin(request);
    const { id } = await params;
    if (!isObjectId(id)) throw new HttpError(404, "Not found.");
    await connectDB();
    const current = await model.findById(id);
    if (!current) throw new HttpError(404, "Not found.");
    if (beforeDelete) await beforeDelete(current);
    await current.deleteOne();
    if (afterDelete) await afterDelete(current);
    revalidateContent();
    return json({ ok: true });
  });

  return { PATCH, DELETE };
}

/**
 * POST { ids: [...] } — the given ids are placed in that order, re-using the SAME set of
 * position values they already held. That makes it safe for paginated / filtered lists:
 * only the visible items swap places, everything else keeps its position.
 */
export function reorderHandler({ model, field = "order", afterReorder }) {
  const POST = handle(async (request) => {
    await requireAdmin(request);
    const body = await readJson(request);
    const ids = Array.isArray(body?.ids) ? [...new Set(body.ids)] : [];
    if (!ids.length || ids.length > 500 || !ids.every(isObjectId)) throw new HttpError(400, "Invalid list.");

    await connectDB();
    const docs = await model.find({ _id: { $in: ids } }).select(field).lean();
    if (docs.length !== ids.length) throw new HttpError(400, "Some items no longer exist. Refresh and try again.");

    const slots = docs.map((d) => d[field] ?? 0).sort((a, b) => a - b);
    // Guarantee strictly increasing slots even if legacy data contains ties.
    for (let i = 1; i < slots.length; i++) if (slots[i] <= slots[i - 1]) slots[i] = slots[i - 1] + 1;

    await model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { [field]: slots[i] } } } })));
    if (afterReorder) await afterReorder();
    revalidateContent();
    return json({ ok: true });
  });
  return { POST };
}
