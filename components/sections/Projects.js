import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/animations/SplitText";
import MaskImage from "@/components/animations/MaskImage";

/** Curated projects — each links to its own cinematic detail page. */
export default function Projects({ projects }) {
  if (!projects.length) return null;
  return (
    <section id="projects" className="scroll-mt-20 border-t border-line bg-char px-6 py-28 md:px-14 md:py-44">
      <div className="mx-auto max-w-[1800px]">
        <p className="eyebrow">03 — Projects</p>
        <h2 className="mt-6 font-serif text-[clamp(52px,7.4vw,120px)] font-normal leading-[0.94] tracking-[-0.02em]">
          <SplitText text={"Visual\n*stories*"} trigger="scroll" />
        </h2>

        <div className="mt-20 grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-12">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              data-cursor="View"
              className={`group block ${i % 3 === 0 ? "md:col-span-7" : i % 3 === 1 ? "md:col-span-5 md:mt-32" : "md:col-span-6 md:col-start-4"}`}
            >
              {p.cover ? (
                <div className="overflow-hidden">
                  <div className="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                    <MaskImage photo={p.cover} direction={i % 2 ? "left" : "up"} sizes="(max-width: 768px) 100vw, 55vw" />
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-coal" />
              )}
              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-serif text-[clamp(30px,3vw,48px)] font-normal leading-tight">{p.title}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-caps text-mute">
                  {[p.categoryLabel, p.date].filter(Boolean).join(" · ")}
                </p>
              </div>
              {p.description ? <p className="mt-3 line-clamp-2 max-w-xl text-[15px] leading-relaxed text-mute">{p.description}</p> : null}
              <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-caps text-gilt">
                View project <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
