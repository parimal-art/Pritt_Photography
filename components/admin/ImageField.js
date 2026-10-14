"use client";

import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { ACCEPT, thumb, uploadToCloudinary } from "@/components/admin/api";

/**
 * Single-image control used for the hero image, about portrait and service images.
 * Uploads straight to Cloudinary (signed), then reports { url, publicId, width, height }.
 * The value is only persisted when the parent form is saved.
 */
export default function ImageField({ value, onChange, label = "image", kind = "site", aspect = "aspect-[4/3]" }) {
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const up = await uploadToCloudinary(file, kind, setProgress);
      onChange({ url: up.url, publicId: up.publicId, width: up.width, height: up.height });
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`relative w-full overflow-hidden border border-line bg-ink ${aspect}`}>
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb(value.url, 900)} alt={`Current ${label}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] uppercase tracking-caps text-mute">No {label}</div>
        )}
        {progress !== null ? (
          <div className="absolute inset-x-0 bottom-0 bg-ink/90 p-2" role="status">
            <div className="h-1 bg-line">
              <div className="h-1 bg-sand transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-mute">Uploading… {progress}%</p>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={input} type="file" accept={ACCEPT} onChange={pick} className="sr-only" aria-label={`Choose ${label} file`} />
        <button type="button" className="a-btn" onClick={() => input.current?.click()} disabled={progress !== null}>
          <ImageUp size={16} strokeWidth={1.5} /> {value?.url ? "Replace" : "Upload"} {label}
        </button>
        {value?.url ? (
          <button type="button" className="a-btn" onClick={() => onChange(null)} disabled={progress !== null}>
            <Trash2 size={16} strokeWidth={1.5} /> Remove
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-[12px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
