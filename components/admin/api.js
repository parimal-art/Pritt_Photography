/** Browser-side helpers for the admin panel. */

export async function api(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (res.status === 401 && !url.includes("/auth/login")) {
    window.location.href = "/admin";
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!res.ok || data.ok === false) {
    const err = new Error(data.message || "Something went wrong. Please try again.");
    err.errors = data.errors || {};
    err.data = data;
    throw err;
  }
  return data;
}

export const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const OK_TYPES = ACCEPT.split(",");
export const MAX_MB = 25;

export function checkFile(file) {
  if (!OK_TYPES.includes(file.type)) return "Only JPG, PNG, WebP or AVIF images are allowed.";
  if (file.size > MAX_MB * 1024 * 1024) return `Each image must be under ${MAX_MB} MB.`;
  return null;
}

/**
 * Signed direct upload to Cloudinary with real progress.
 * kind: "photo" (gallery folder) | "site" (hero / about / service images)
 * @returns {Promise<{publicId: string, url: string, width: number, height: number}>}
 */
export async function uploadToCloudinary(file, kind, onProgress) {
  const problem = checkFile(file);
  if (problem) throw new Error(problem);
  const sign = await api("/api/admin/uploads/sign", { method: "POST", body: { kind } });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);
  form.append("allowed_formats", sign.allowedFormats);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", sign.uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading. Please try again."));
    xhr.onload = () => {
      let res = {};
      try {
        res = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300 && res.public_id) {
        resolve({ publicId: res.public_id, url: res.secure_url, width: res.width, height: res.height });
      } else {
        reject(new Error(res?.error?.message || "Upload failed. Please try again."));
      }
    };
    xhr.send(form);
  });
}

/** Cloudinary thumbnail URL for admin grids (fast, small). */
export function thumb(url, w = 480) {
  return typeof url === "string" && url.includes("/upload/") ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${w}/`) : url;
}
