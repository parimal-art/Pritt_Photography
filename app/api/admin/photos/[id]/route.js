import { connectDB } from "@/lib/db/connect";
import { Photo, Project, Setting } from "@/lib/db/models";
import { plain } from "@/lib/db/serialize";
import { handle, json, readJson, requireAdmin, HttpError } from "@/lib/auth/session";
import { validateOrThrow, isObjectId } from "@/lib/validation";
import { verifyAsset } from "@/lib/cloudinary";
import { deleteAssetIfUnused } from "@/lib/admin/assets";
import { revalidateContent } from "@/lib/admin/revalidate";
import { PHOTO_RULES } from "@/lib/admin/resources";

export const runtime = "nodejs";

/**
 * PATCH body = any photo fields, plus optional:
 *   position:   1-based gallery position (moves the photo, shifts the others)
 *   replaceWith: publicId of a freshly uploaded image (replaces the file, keeps the metadata)
 *   useAsHero:  true -> use this photograph as the landing-page hero image
 */
export const PATCH = handle(async (request, { params }) => {
  await requireAdmin(request);
  const { id } = await params;
  if (!isObjectId(id)) throw new HttpError(404, "Not found.");
  const body = await readJson(request);
  const data = validateOrThrow(body, PHOTO_RULES, { partial: true });

  await connectDB();
  const photo = await Photo.findById(id);
  if (!photo) throw new HttpError(404, "Not found.");

  if (data.project) {
    if (!(await Project.exists({ _id: data.project }))) throw new HttpError(422, "That project no longer exists.");
  }
  if (data.featured === true && !photo.featured) {
    const top = await Photo.findOne({ featured: true }).sort({ featuredOrder: -1 }).select("featuredOrder").lean();
    data.featuredOrder = (top?.featuredOrder ?? -1) + 1;
  }

  let oldPublicId = null;
  if (body?.replaceWith) {
    const asset = await verifyAsset(body.replaceWith, "photo");
    if (asset.publicId !== photo.publicId) {
      if (await Photo.exists({ publicId: asset.publicId })) throw new HttpError(409, "That image is already used.");
      oldPublicId = photo.publicId;
      Object.assign(data, asset);
    }
  }

  photo.set(data);
  await photo.save();

  if (body?.position != null) {
    const position = Number(body.position);
    if (!Number.isInteger(position) || position < 1) throw new HttpError(422, "Position must be 1 or higher.");
    const all = await Photo.find().sort({ order: 1, createdAt: 1 }).select("_id").lean();
    const ids = all.map((d) => String(d._id)).filter((x) => x !== id);
    ids.splice(Math.min(position - 1, ids.length), 0, id);
    await Photo.bulkWrite(ids.map((pid, i) => ({ updateOne: { filter: { _id: pid }, update: { $set: { order: i } } } })));
  }

  if (body?.useAsHero === true) {
    await Setting.updateOne(
      { key: "site" },
      { $set: { heroImage: { url: photo.url, publicId: photo.publicId, width: photo.width, height: photo.height } } },
      { upsert: true }
    );
  }

  if (oldPublicId) await deleteAssetIfUnused(oldPublicId);
  revalidateContent();
  const fresh = await Photo.findById(id).lean();
  return json({ ok: true, item: plain(fresh) });
});

export const DELETE = handle(async (request, { params }) => {
  await requireAdmin(request);
  const { id } = await params;
  if (!isObjectId(id)) throw new HttpError(404, "Not found.");
  await connectDB();
  const photo = await Photo.findById(id);
  if (!photo) throw new HttpError(404, "Not found.");
  const publicId = photo.publicId;
  await photo.deleteOne();
  await Project.updateMany({ coverPhoto: id }, { $set: { coverPhoto: null } });
  await deleteAssetIfUnused(publicId); // skipped automatically if hero/about/service still use it
  revalidateContent();
  return json({ ok: true });
});
