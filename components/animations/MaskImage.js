"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";
import PhotoImage from "@/components/ui/PhotoImage";

/**
 * Photograph that is revealed through an animated clip-path mask when it enters
 * the viewport, with an inner scale settle and optional scroll parallax.
 *
 * direction: "up" | "left" | "right"  (which edge the mask opens from)
 * parallax:  % of vertical drift while scrolling (0 disables)
 */
const CLIPS = {
  up: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

export default function MaskImage({
  photo,
  sizes,
  priority = false,
  direction = "up",
  parallax = 7,
  className = "",
  imageWrapperClass = "",
}) {
  const ref = useRef(null);

  useGsap(
    ({ motion }) => {
      if (!motion || !ref.current) return;
      const el = ref.current;
      const scaler = el.querySelector("[data-scale]");
      const drift = el.querySelector("[data-drift]");

      gsap.set(el, { clipPath: CLIPS[direction] });
      gsap.set(scaler, { scale: 1.3 });

      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", once: true } });
      tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power4.inOut" }).to(
        scaler,
        { scale: 1, duration: 1.8, ease: "power3.out" },
        0
      );

      if (parallax && drift) {
        gsap.fromTo(
          drift,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }
    },
    ref,
    [direction, parallax, photo?.src]
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div data-scale className="will-change-transform">
        <div data-drift className="scale-[1.14] will-change-transform">
          <PhotoImage photo={photo} sizes={sizes} priority={priority} className={imageWrapperClass} />
        </div>
      </div>
    </div>
  );
}
