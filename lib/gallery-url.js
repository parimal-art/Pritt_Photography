/**
 * Builds /gallery URLs while keeping the active category.
 * Used by the filters and the pagination so changing one never loses the other.
 */
export function galleryHref({ category = "all", page = 1, q = "" } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category && category !== "all") params.set("category", category);
  if (page && Number(page) > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/gallery?${qs}` : "/gallery";
}

/** [1, "…", 4, 5, 6, "…", 12] — compact page list with the current page in the middle. */
export function pageWindow(current, total, siblings = 1) {
  if (total <= 5 + siblings * 2) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total]);
  for (let p = current - siblings; p <= current + siblings; p++) if (p > 1 && p < total) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}
