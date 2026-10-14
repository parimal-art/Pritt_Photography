import { connectDB } from "@/lib/db/connect";
import { Photo } from "@/lib/db/models";
import { plain, plainList } from "@/lib/db/serialize";
import { handle, json, readJson, requireAdmin, HttpError } from "@/lib/auth/session";
import { validate, escapeRegex, isObjectId } from "@/lib/validation";
import { verifyAsset } from "@/lib/cloudinary";
import { revalidateContent } from "@/lib/admin/revalidate";
import { PHOTO_RULES } from "@/lib/admin/resources";

export const runtime = "nodejs";

/** GET ?q=&category=<id>&status=published|draft&featured=1&page=&perPage= */
export const GET = handle(async (request) => {
  await requireAdmin(request);
  await connectDB();
  const sp = request.nextUrl.searchParams;
  const filter = {};
  const q = (sp.get("q") || "").trim().slice(0, 80);
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
  if (isObjectId(sp.get("category"))) filter.categories = sp.get("category");
  if (sp.get("status") === "published") filter.published = true;
  if (sp.get("status") === "draft") filter.published = false;
  if (sp.get("featured") === "1") filter.featured = true;

  const perPage = Math.min(Math.max(parseInt(sp.get("perPage"), 10) || 24, 1), 60);
  const total = await Photo.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(parseInt(sp.get("page"), 10) || 1, 1), totalPages);
  const sort = sp.get("featured") === "1" ? { featuredOrder: 1, createdAt: 1 } : { order: 1, createdAt: 1 };
  const items = await Photo.find(filter).sort(sort).skip((page - 1) * perPage).limit(perPage).lean();
  return json({ ok: true, items: plainList(items), total, page, totalPages, perPage });
});

/** POST { items: [{ publicId, title?, categories?, published?, ... }] } — after the direct Cloudinary upload. */
export const POST = handle(async (request) => {
  await requireAdmin(request);
  const body = await readJson(request);
  const list = Array.isArray(body?.items) ? body.items.slice(0, 20) : [];
  if (!list.length) throw new HttpError(400, "No photographs to save.");

  await connectDB();
  const last = await Photo.findOne().sort({ order: -1 }).select("order").lean();
  let order = (last?.order ?? -1) + 1;
  const created = [];
  const failed = [];

  for (const raw of list) {
    try {
      const asset = await verifyAsset(raw?.publicId, "photo");
      if (await Photo.exists({ publicId: asset.publicId })) throw new HttpError(409, "Already saved.");
      const fallbackTitle = (asset.publicId.split("/").pop() || "Untitled").replace(/[-_]+/g, " ").slice(0, 120);
      const { data, errors } = validate({ ...raw, title: raw?.title || fallbackTitle }, PHOTO_RULES, { partial: true });
      if (Object.keys(errors).length) throw new HttpError(422, Object.values(errors)[0]);
      const doc = await Photo.create({
        published: true,
        ...data,
        alt: data.alt || data.title,
        ...asset,
        order: order++,
      });
      created.push(plain(doc.toObject()));
    } catch (err) {
      failed.push({ publicId: raw?.publicId || "", message: err instanceof HttpError ? err.message : "Could not save this photograph." });
    }
  }
  if (created.length) revalidateContent();
  return json({ ok: created.length > 0, items: created, failed }, created.length ? 201 : 400);
});
