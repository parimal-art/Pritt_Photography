"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode, Keyboard, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import PhotoImage from "@/components/ui/PhotoImage";

/**
 * Full-screen viewer (Swiper.js).
 *  - Swipe on touch, ← / → on keyboard (Swiper Keyboard module), buttons on screen
 *  - Thumbnail rail synced with the main slider (Swiper Thumbs)
 *  - Counter "03 / 12", Esc closes, focus is trapped while open and restored by the parent
 * Pagination is NOT handled here — the viewer only browses the photographs of the
 * current gallery page; page navigation lives in the gallery itself.
 */
export default function Lightbox({ photos, startIndex = 0, onClose }) {
  const [main, setMain] = useState(null);
  const [thumbs, setThumbs] = useState(null);
  const [active, setActive] = useState(startIndex);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  // Lock page scroll, close on Escape, trap focus inside the dialog.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const total = photos.length;
  const current = photos[active] || photos[0];
  const pad = (n) => String(n).padStart(2, "0");
  const iconBtn =
    "flex h-12 w-12 items-center justify-center border border-line bg-ink/70 text-bone transition-colors hover:border-bone disabled:opacity-30";

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photograph viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[80] flex flex-col bg-black"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 md:px-10">
        <p className="text-[13px] uppercase tracking-caps text-ash" aria-live="polite">
          <span className="text-bone">{pad(active + 1)}</span> / {pad(total)}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close viewer" className={iconBtn}>
          <X size={20} strokeWidth={1.4} />
        </button>
      </div>

      {/* Main slider */}
      <div className="relative min-h-0 flex-1">
        <Swiper
          className="lightbox-swiper h-full"
          modules={[A11y, Keyboard, Thumbs]}
          initialSlide={startIndex}
          speed={700}
          grabCursor
          keyboard={{ enabled: true, onlyInViewport: false }}
          thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
          a11y={{ prevSlideMessage: "Previous photograph", nextSlideMessage: "Next photograph" }}
          onSwiper={setMain}
          onSlideChange={(s) => setActive(s.activeIndex)}
        >
          {photos.map((photo, i) => (
            <SwiperSlide key={photo.id}>
              <div className="h-full px-4 py-2 md:px-24">
                <PhotoImage
                  photo={photo}
                  ratio={false}
                  fit="contain"
                  priority={i === startIndex}
                  quality={85}
                  sizes="100vw"
                  className="!bg-transparent"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          onClick={() => main?.slidePrev()}
          disabled={active === 0}
          aria-label="Previous photograph"
          className={`${iconBtn} absolute left-3 top-1/2 z-10 -translate-y-1/2 md:left-8`}
        >
          <ChevronLeft size={22} strokeWidth={1.4} />
        </button>
        <button
          type="button"
          onClick={() => main?.slideNext()}
          disabled={active === total - 1}
          aria-label="Next photograph"
          className={`${iconBtn} absolute right-3 top-1/2 z-10 -translate-y-1/2 md:right-8`}
        >
          <ChevronRight size={22} strokeWidth={1.4} />
        </button>
      </div>

      {/* Caption */}
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2 px-5 pb-3 pt-4 md:px-10">
        <div className="min-w-0">
          <h2 className="font-serif text-[clamp(24px,2.4vw,34px)] leading-tight">{current?.title}</h2>
          {current?.caption ? <p className="mt-1 max-w-xl text-[14px] text-ash">{current.caption}</p> : null}
        </div>
        <p className="text-[11px] uppercase tracking-caps text-mute">
          {[current?.categoryLabel, current?.location, current?.date].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* Thumbnails */}
      {total > 1 ? (
        <div className="px-5 pb-5 md:px-10">
          <Swiper
            className="thumbs-swiper"
            modules={[FreeMode, Thumbs]}
            onSwiper={setThumbs}
            slidesPerView="auto"
            spaceBetween={10}
            freeMode
            watchSlidesProgress
          >
            {photos.map((photo) => (
              <SwiperSlide key={photo.id} style={{ width: 72 }}>
                <div className="relative aspect-[4/3] w-full">
                  <PhotoImage photo={photo} alt="" sizes="72px" quality={50} ratio={false} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : null}
    </motion.div>
  );
}
