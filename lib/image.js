/**
 * Image helpers shared by server and client components.
 */

export function isCloudinaryUrl(src) {
  return typeof src === "string" && src.includes("res.cloudinary.com") && src.includes("/upload/");
}

export function isSvg(src) {
  return typeof src === "string" && src.toLowerCase().split("?")[0].endsWith(".svg");
}

/**
 * next/image loader that lets Cloudinary resize and re-encode (f_auto, q_auto)
 * instead of the Next.js image optimizer — faster and cheaper on Vercel.
 */
export function cloudinaryLoader({ src, width, quality }) {
  const q = quality ? `q_${quality}` : "q_auto";
  return src.replace("/upload/", `/upload/f_auto,${q},c_limit,w_${width}/`);
}
