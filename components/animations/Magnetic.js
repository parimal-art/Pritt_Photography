"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";

/**
 * Wraps a button/link so it is gently pulled toward the pointer.
 * Only active on fine pointers with motion allowed.
 */
export default function Magnetic({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);

  useGsap(
    ({ motion, fine }) => {
      if (!motion || !fine || !ref.current) return;
      const el = ref.current;
      const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
      const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });

      const move = (e) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * strength);
        y((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        x(0);
        y(0);
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    ref,
    [strength]
  );

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
