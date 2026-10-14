import { slugify } from "@/lib/validation";

/** Returns `base`, or `base-2`, `base-3`… so the slug is unique within the collection. */
export async function uniqueSlug(model, base, excludeId = null) {
  const root = slugify(base) || "item";
  let candidate = root;
  for (let n = 2; n < 500; n++) {
    const clash = await model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!clash) return candidate;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}
