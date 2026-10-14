"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Renders nothing until you add genuine testimonials in lib/config.js. */
export default function Testimonials({ items = [] }) {
  const [index, setIndex] = useState(0);
  if (!items.length) return null;

  const t = items[index];
  const step = (dir) => setIndex((i) => (i + dir + items.length) % items.length);

  return (
    <section aria-label="Client testimonials" className="px-6 py-28 text-center md:px-14 md:py-40">
      <p className="eyebrow">05 — Kind words</p>
      <div className="mx-auto mt-10 min-h-[220px] max-w-5xl" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.figure
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote className="font-serif text-[clamp(30px,4vw,60px)] italic leading-[1.15]">{t.quote}</blockquote>
            <figcaption className="mt-8 text-[12px] uppercase tracking-caps text-mute">
              {t.name}
              {t.project ? ` — ${t.project}` : ""}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      {items.length > 1 ? (
        <div className="mt-10 flex justify-center gap-3">
          <button type="button" onClick={() => step(-1)} aria-label="Previous testimonial" className="flex h-12 w-12 items-center justify-center border border-line hover:border-bone">
            <ChevronLeft size={20} strokeWidth={1.4} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next testimonial" className="flex h-12 w-12 items-center justify-center border border-line hover:border-bone">
            <ChevronRight size={20} strokeWidth={1.4} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
