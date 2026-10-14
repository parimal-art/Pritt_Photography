/**
 * Cloudinary (server only). The API secret never leaves this file / the server.
 *
 * Upload flow (signed direct upload — works on Vercel, which limits request bodies to ~4.5 MB):
 *   1. Browser asks  POST /api/admin/uploads/sign          -> signed params (admin only)
 *   2. Browser sends the file straight to Cloudinary        (shows real upload progress)
 *   3. Browser calls POST /api/admin/photos with the publicId
 *   4. Server re-reads the asset from Cloudinary (verifyAsset) and only then saves it
 *      to MongoDB — nothing the browser claims about size/format is trusted.
 */
import { v2 as cloudinary } from "cloudinary";
import { HttpError } from "@/lib/auth/session";

export const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];
export const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per photograph

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function configure() {
  if (!isCloudinaryConfigured()) throw new HttpError(503, "Cloudinary is not configured on the server.");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function baseFolder() {
  return (process.env.CLOUDINARY_FOLDER || "pritt-photography").replace(/^\/+|\/+$/g, "");
}

/** Browsers can only pick one of these two destinations — never an arbitrary folder. */
export function folderFor(kind) {
  return kind === "site" ? `${baseFolder()}/site` : `${baseFolder()}/gallery`;
}

export function signUpload(kind) {
  const c = configure();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = folderFor(kind);
  const allowed_formats = ALLOWED_FORMATS.join(",");
  const signature = c.utils.api_sign_request({ allowed_formats, folder, timestamp }, process.env.CLOUDINARY_API_SECRET);
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder,
    allowedFormats: allowed_formats,
    maxBytes: MAX_BYTES,
  };
}

/** Confirms an uploaded asset really exists in OUR folder and meets the limits. */
export async function verifyAsset(publicId, kind) {
  const c = configure();
  if (typeof publicId !== "string" || !publicId.startsWith(`${folderFor(kind)}/`)) {
    throw new HttpError(400, "That image is not in the allowed upload folder.");
  }
  let asset;
  try {
    asset = await c.api.resource(publicId, { resource_type: "image" });
  } catch {
    throw new HttpError(400, "The uploaded image could not be found on Cloudinary.");
  }
  const format = String(asset.format || "").toLowerCase();
  if (!ALLOWED_FORMATS.includes(format) || asset.bytes > MAX_BYTES) {
    await c.uploader.destroy(publicId, { invalidate: true, resource_type: "image" }).catch(() => {});
    throw new HttpError(400, "Only JPG, PNG, WebP or AVIF images up to 25 MB are allowed.");
  }
  return {
    url: asset.secure_url,
    publicId: asset.public_id,
    width: asset.width,
    height: asset.height,
    format,
    bytes: asset.bytes,
  };
}

/** Deletes one asset, but only inside our own folder. Failures are logged, never thrown. */
export async function destroyAsset(publicId) {
  try {
    if (!publicId || !String(publicId).startsWith(`${baseFolder()}/`)) return;
    await configure().uploader.destroy(publicId, { invalidate: true, resource_type: "image" });
  } catch (err) {
    console.error("[cloudinary] destroy failed for", publicId, err?.message || err);
  }
}
