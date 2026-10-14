"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cloudinaryLoader, isCloudinaryUrl, isSvg } from "@/lib/image";

/**
 * The one image component used everywhere.
 *
 * - Reserves the exact aspect ratio (no layout shift) from the photo's real size
 * - Cloudinary URLs are resized/re-encoded by Cloudinary (f_auto, q_auto)
 * - Local .svg placeholders are served as-is
 * - Soft fade-in placeholder while loading, and a clean fallback if the image fails
 *
 * Pass `photo` ({src,width,height,alt}) OR the individual props.
 * Use `fit="contain"` + `ratio={false}` when the parent supplies the box (lightbox).
 */
export default function PhotoImage({
  photo,
  src,
  width,
  height,
  alt,
  sizes = "100vw",
  priority = false,
  quality = 80,
  fit = "cover",
  ratio = true,
  className = "",
  imgClassName = "",
  objectPosition,
}) {
  const s = src ?? photo?.src;
  const w = width ?? photo?.width ?? 1600;
  const h = height ?? photo?.height ?? 1067;
  const a = alt ?? photo?.alt ?? photo?.title ?? "";

  const [status, setStatus] = useState("loading");
  const imgRef = useRef(null);

  // Images already cached before hydration never fire onLoad — check manually.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete) setStatus(el.naturalWidth > 0 ? "loaded" : "error");
  }, [s]);

  useEffect(() => setStatus("loading"), [s]);

  const boxStyle = ratio ? { aspectRatio: `${w} / ${h}` } : undefined;

  if (status === "error") {
    return (
      <div
        role="img"
        aria-label={a || "Image unavailable"}
        style={boxStyle}
        className={`relative flex items-center justify-center bg-coal text-[11px] uppercase tracking-caps text-mute ${ratio ? "w-full" : "h-full w-full"} ${className}`}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <div style={boxStyle} className={`relative overflow-hidden bg-coal ${ratio ? "w-full" : "h-full w-full"} ${className}`}>
      <Image
        ref={imgRef}
        src={s}
        alt={a}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        loader={isCloudinaryUrl(s) ? cloudinaryLoader : undefined}
        unoptimized={isSvg(s)}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        style={objectPosition ? { objectPosition } : undefined}
        className={`${fit === "contain" ? "object-contain" : "object-cover"} transition-opacity duration-700 ${status === "loaded" ? "opacity-100" : "opacity-0"} ${imgClassName}`}
      />
    </div>
  );
}
