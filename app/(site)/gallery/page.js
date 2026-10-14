import Link from "next/link";
import { getCategories, getPhotosPage, getSettings } from "@/lib/db/queries";
import SplitText from "@/components/animations/SplitText";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import Pagination from "@/components/gallery/Pagination";

export async function generateMetadata() {
  const s = await getSettings();
  return { title: "Gallery", description: `The complete archive of photographs by ${s.brandName}.` };
}

const first = (v) => (Array.isArray(v) ? v[0] : v);

/** /gallery?category=weddings&q=bride&page=2 — filtering, search and paging run in MongoDB. */
export default async function GalleryPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const category = String(first(sp.category) || "all").toLowerCase();
  const q = String(first(sp.q) || "").slice(0, 80);
  const settings = await getSettings();

  const [data, cats] = await Promise.all([
    getPhotosPage({ category, q, page: first(sp.page) || 1, perPage: settings.galleryPageSize }),
    getCategories(),
  ]);
  const activeCat = cats.categories.find((c) => c.slug === data.category);
  const heading = activeCat ? activeCat.name : "The *Archive*";

  return (
    <div className="mx-auto max-w-[1800px] px-6 pb-24 pt-36 md:px-14 md:pt-44">
      <header className="flex flex-wrap items-end justify-between gap-8">
        <h1 className="font-serif text-[clamp(60px,10vw,168px)] font-normal leading-[0.9] tracking-[-0.02em]">
          <SplitText text={heading} />
        </h1>
        <p className="max-w-xs text-[14px] leading-relaxed text-mute">
          {data.total} {data.total === 1 ? "photograph" : "photographs"}
          {activeCat ? ` in ${activeCat.name}` : ""}
          {q ? ` matching “${q}”` : ""}.
        </p>
      </header>

      <div className="mt-14 border-b border-line pb-10">
        <GalleryFilters categories={cats.categories} active={data.category} total={cats.total} q={q} />
      </div>

      <div className="pt-14">
        {data.error ? (
          <State title="The gallery is taking a moment" text="We could not load the photographs. Please try again shortly." action={{ href: "/gallery", label: "Try again" }} />
        ) : data.items.length === 0 ? (
          <State
            title="Nothing here yet"
            text={q || data.category !== "all" ? "No photographs match this filter." : "No photographs have been published yet."}
            action={q || data.category !== "all" ? { href: "/gallery", label: "View all photographs" } : null}
          />
        ) : (
          <>
            <GalleryGrid key={`${data.category}-${q}-${data.page}`} photos={data.items} />
            <div className="border-t border-line pt-10">
              <Pagination page={data.page} totalPages={data.totalPages} category={data.category} q={q} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function State({ title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-5 py-28 text-center">
      <p className="font-serif text-[clamp(32px,4vw,56px)] leading-tight">{title}</p>
      <p className="max-w-md text-[16px] text-mute">{text}</p>
      {action ? (
        <Link href={action.href} className="btn-outline">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
