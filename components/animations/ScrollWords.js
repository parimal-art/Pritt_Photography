"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";

/**
 * Paragraph whose words brighten one after another as the reader scrolls
 * (scrubbed to scroll position — progressive reading, no scroll hijacking).
 */
export default function ScrollWords({ text, as: Tag = "p", className = "" }) {
  const ref = useRef(null);
  const words = text.split(" ").filter(Boolean);

  useGsap(
    ({ motion }) => {
      if (!motion || !ref.current) return;
      gsap.fromTo(
        ref.current.querySelectorAll("[data-sw]"),
        { opacity: 0.18 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 82%", end: "bottom 50%", scrub: true },
        }
      );
    },
    ref,
    [text]
  );

  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} data-sw>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
