"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { gsap, ScrollTrigger, useGsap } from "@/lib/gsap";
import PhotoImage from "@/components/ui/PhotoImage";

// Swiper is heavy: only download it when a photograph is opened.
const Lightbox = dynamic(() => import("@/components/gallery/Lightbox"), { ssr: false });

/**
 * Masonry-style gallery for ONE page of photographs.
 * The parent gives this component a `key` built from category + page, so every
 * filter/page change remounts it and the staggered reveal plays again.
 */
export default function GalleryGrid({ photos }) {
  const root = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);
  const lastTrigger = useRef(null);

  useGsap(
    ({ motion }) => {
      if (!motion || !root.current) return;
      const items = root.current.querySelectorAll("[data-g-item]");
      if (!items.length) return;
      gsap.set(items, { y: 48, opacity: 0 });
      ScrollTrigger.batch(items, {
        start: "top 94%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.95, ease: "power3.out", stagger: 0.09, overwrite: true }),
      });
    },
    root,
    [photos]
  );

  const open = (index, el) => {
    lastTrigger.current = el;
    setOpenIndex(index);
  };

  const close = useCallback(() => {
    setOpenIndex(null);
    // Return focus to the photograph that opened the viewer
    window.setTimeout(() => lastTrigger.current?.focus?.(), 0);
  }, []);

  return (
    <>
      <ul ref={root} className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {photos.map((photo, i) => (
          <li key={photo.id} data-g-item className="mb-10 break-inside-avoid">
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              data-cursor="View"
              aria-label={`Open ${photo.title} in the viewer`}
              className="group block w-full text-left"
            >
              <div className="overflow-hidden">
                <PhotoImage
                  photo={photo}
                  priority={i < 3}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
              </div>
              <span className="mt-3 flex items-baseline justify-between gap-4 text-[11px] uppercase tracking-caps text-mute">
                <span className="truncate transition-colors group-hover:text-bone">{photo.title}</span>
                <span className="flex-none">{photo.categoryLabel}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {openIndex !== null ? <Lightbox key="lightbox" photos={photos} startIndex={openIndex} onClose={close} /> : null}
      </AnimatePresence>
    </>
  );
}
