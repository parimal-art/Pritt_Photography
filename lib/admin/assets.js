import { Photo, Service, Setting } from "@/lib/db/models";
import { destroyAsset } from "@/lib/cloudinary";

export async function isAssetReferenced(publicId) {
  if (!publicId) return false;
  const [photo, service, setting] = await Promise.all([
    Photo.exists({ publicId }),
    Service.exists({ "image.publicId": publicId }),
    Setting.exists({ $or: [{ "heroImage.publicId": publicId }, { "aboutImage.publicId": publicId }] }),
  ]);
  return Boolean(photo || service || setting);
}

/** Removes the Cloudinary file unless something else (photo, hero, about, service) still uses it. */
export async function deleteAssetIfUnused(publicId) {
  if (!publicId) return;
  if (await isAssetReferenced(publicId)) return;
  await destroyAsset(publicId);
}
