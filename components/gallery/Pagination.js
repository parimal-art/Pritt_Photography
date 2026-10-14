import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { galleryHref, pageWindow } from "@/lib/gallery-url";

/**
 * Server-driven pagination. Each control is a link to /gallery?category=…&page=N,
 * so the active category is preserved on every page change.
 */
export default function Pagination({ page, totalPages, category, q = "" }) {
  if (totalPages <= 1) {
    return (
      <p className="text-[12px] uppercase tracking-caps text-mute">
        Page 1 of 1
      </p>
    );
  }

  const box = "flex h-11 min-w-[44px] items-center justify-center border px-3 text-[13px] transition-colors duration-300";
  const idle = "border-line text-bone hover:border-bone";
  const current = "border-bone bg-bone text-ink";
  const disabled = "cursor-not-allowed border-line text-mute/40";

  return (
    <nav aria-label="Gallery pages" className="flex flex-wrap items-center justify-between gap-6">
      <p className="text-[12px] uppercase tracking-caps text-mute" aria-live="polite">
        Page {page} of {totalPages}
      </p>

      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={galleryHref({ category, q, page: page - 1 })} rel="prev" aria-label="Previous page" className={`${box} ${idle}`}>
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Link>
          ) : (
            <span aria-disabled="true" aria-label="Previous page (unavailable)" className={`${box} ${disabled}`}>
              <ArrowLeft size={18} strokeWidth={1.5} />
            </span>
          )}
        </li>

        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-2 text-mute">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={galleryHref({ category, q, page: p })}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={`${box} ${p === page ? current : idle}`}
              >
                {p}
              </Link>
            </li>
          )
        )}

        <li>
          {page < totalPages ? (
            <Link href={galleryHref({ category, q, page: page + 1 })} rel="next" aria-label="Next page" className={`${box} ${idle}`}>
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
          ) : (
            <span aria-disabled="true" aria-label="Next page (unavailable)" className={`${box} ${disabled}`}>
              <ArrowRight size={18} strokeWidth={1.5} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
