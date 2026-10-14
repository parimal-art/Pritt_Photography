import Link from "next/link";
import { Search } from "lucide-react";
import { galleryHref } from "@/lib/gallery-url";

/**
 * Category filters (real links, so they are shareable and work without JavaScript) plus a
 * title search (a plain GET form). Changing the category or searching returns to page 1;
 * the search term is kept when the category changes.
 */
export default function GalleryFilters({ categories, active, total, q = "" }) {
  const base = "inline-flex min-h-[44px] items-center border px-5 py-2 text-[11px] font-semibold uppercase tracking-caps transition-colors duration-300";
  const on = "border-bone bg-bone text-ink";
  const off = "border-line text-ash hover:border-bone hover:text-bone";

  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <nav aria-label="Filter photographs by category" className="flex flex-wrap gap-3">
        <Link href={galleryHref({ q })} scroll={false} aria-current={active === "all" ? "true" : undefined} className={`${base} ${active === "all" ? on : off}`}>
          All <span className="ml-2 text-[10px] opacity-60">{total}</span>
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={galleryHref({ category: c.slug, q })} scroll={false} aria-current={active === c.slug ? "true" : undefined} className={`${base} ${active === c.slug ? on : off}`}>
            {c.name} <span className="ml-2 text-[10px] opacity-60">{c.count}</span>
          </Link>
        ))}
      </nav>

      <form action="/gallery" method="get" role="search" className="flex items-center border-b border-line focus-within:border-sand">
        {active !== "all" ? <input type="hidden" name="category" value={active} /> : null}
        <label htmlFor="gallery-search" className="sr-only">
          Search photographs by title
        </label>
        <input id="gallery-search" name="q" type="search" defaultValue={q} placeholder="Search titles" className="w-44 bg-transparent py-3 text-[14px] text-bone placeholder:text-mute/70 focus:outline-none" />
        <button type="submit" aria-label="Search" className="flex h-11 w-11 items-center justify-center text-mute hover:text-bone">
          <Search size={18} strokeWidth={1.5} />
        </button>
      </form>
    </div>
  );
}
