"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SplitText from "@/components/animations/SplitText";
import MaskImage from "@/components/animations/MaskImage";

const Lightbox = dynamic(() => import("@/components/gallery/Lightbox"), { ssr: false });

const LAYOUT = [
  "md:col-span-8",
  "md:col-span-4 md:mt-40",
  "md:col-span-5 md:col-start-2",
  "md:col-span-6 md:col-start-7 md:-mt-24",
  "md:col-span-7",
  "md:col-span-4 md:col-start-9 md:mt-24",
  "md:col-span-6",
  "md:col-span-5 md:col-start-8 md:mt-16",
];
const DIRECTIONS = ["up", "left", "right", "up", "right", "left", "up", "right"];

/**
 * Photographs the administrator marked "featured" (Admin → Featured Work), in the order
 * they arranged. Each keeps its own proportions; clicking opens the Swiper viewer.
 */
export default function FeaturedWork({ photos }) {
  const [openIndex, setOpenIndex] = useState(null);
  const trigger = useRef(null);
  const close = useCallback(() => {
    setOpenIndex(null);
    window.setTimeout(() => trigger.current?.focus?.(), 0);
  }, []);
  if (!photos.length) return null;

  return (
    <section id="portfolio" className="scroll-mt-20 px-6 py-28 md:px-14 md:py-44">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-20 flex flex-wrap items-end justify-between gap-8 md:mb-28">
          <div>
            <p className="eyebrow">02 — Featured work</p>
            <h2 className="mt-6 font-serif text-[clamp(54px,8vw,132px)] font-normal leading-[0.92] tracking-[-0.02em]">
              <SplitText text={"Selected\n*work*"} trigger="scroll" />
            </h2>
          </div>
          <Link href="/gallery" data-cursor="Open" className="link-underline inline-flex items-center gap-4 py-3 text-[12px] font-semibold uppercase tracking-caps">
            View complete gallery
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-12">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              data-cursor="View"
              aria-label={`Open ${photo.title}`}
              onClick={(e) => {
                trigger.current = e.currentTarget;
                setOpenIndex(i);
              }}
              className={`group block text-left ${LAYOUT[i % LAYOUT.length]}`}
            >
              <div className="overflow-hidden">
                <div className="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                  <MaskImage photo={photo} direction={DIRECTIONS[i % DIRECTIONS.length]} sizes="(max-width: 768px) 100vw, 60vw" priority={i === 0} />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-serif text-[clamp(28px,2.6vw,40px)] font-normal leading-tight">{photo.title}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-caps text-mute">
                  {photo.categoryLabel}
                  {photo.date ? ` · ${photo.date}` : ""}
                </p>
              </div>
              {photo.caption ? <p className="mt-2 max-w-md translate-y-1 text-[14px] text-mute opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">{photo.caption}</p> : null}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>{openIndex !== null ? <Lightbox key="lb" photos={photos} startIndex={openIndex} onClose={close} /> : null}</AnimatePresence>
    </section>
  );
}
