/** Shown instantly while the server fetches the next gallery page / category. */
export default function GalleryLoading() {
  const ratios = ["aspect-[4/5]", "aspect-[3/2]", "aspect-square", "aspect-[3/4]", "aspect-[16/10]", "aspect-[4/5]"];
  return (
    <div className="mx-auto max-w-[1800px] px-6 pb-24 pt-36 md:px-14 md:pt-44" role="status" aria-live="polite">
      <span className="sr-only">Loading photographs…</span>
      <div className="h-24 w-2/3 animate-pulse bg-coal md:h-40" />
      <div className="mt-14 flex flex-wrap gap-3 border-b border-line pb-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-11 w-28 animate-pulse bg-coal" />
        ))}
      </div>
      <div className="columns-1 gap-6 pt-14 sm:columns-2 lg:columns-3">
        {ratios.map((r, i) => (
          <div key={i} className={`mb-10 w-full animate-pulse break-inside-avoid bg-coal ${r}`} />
        ))}
      </div>
    </div>
  );
}
