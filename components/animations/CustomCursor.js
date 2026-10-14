"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Minimal custom cursor: a small dot + a trailing ring. The ring grows and shows a
 * label over any element with data-cursor="Label" (e.g. data-cursor="View").
 * Disabled on touch devices and for visitors who prefer reduced motion. The native
 * cursor always stays visible.
 */
export default function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm || !dot.current || !ring.current) return;

    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, opacity: 0 });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.1, ease: "power3" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.1, ease: "power3" });
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });

    let visible = false;
    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 });
    };
    const hide = () => {
      visible = false;
      gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });
    };

    const onMove = (e) => {
      show();
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e) => {
      const target = e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
      if (target) {
        setLabel(target.getAttribute("data-cursor") || "");
        gsap.to(ring.current, { scale: 2.1, duration: 0.4, ease: "power3.out" });
        gsap.to(dot.current, { scale: 0, duration: 0.3 });
      } else {
        setLabel("");
        gsap.to(ring.current, { scale: 1, duration: 0.4, ease: "power3.out" });
        gsap.to(dot.current, { scale: 1, duration: 0.3 });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", hide);
      gsap.killTweensOf([dot.current, ring.current]);
    };
  }, []);

  return (
    <div className="cursor-layer pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
      <div ref={ring} className="fixed left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-bone/70 opacity-0 mix-blend-difference">
        <span className="text-[5px] uppercase tracking-caps text-bone">{label}</span>
      </div>
      <div ref={dot} className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-bone opacity-0" />
    </div>
  );
}
