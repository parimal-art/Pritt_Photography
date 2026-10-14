"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";

/**
 * Masked word-by-word headline reveal (no paid SplitText plugin needed).
 *
 * - Use "\n" for line breaks and *word* to mark an emphasised (italic, sand) word.
 * - trigger="load" plays on mount (hero); trigger="scroll" plays when scrolled into view.
 * - Server-rendered as plain text, so it is readable without JavaScript and for
 *   screen readers (the visual words are aria-hidden, the wrapper carries the label).
 */
export default function SplitText({
  text,
  as: Tag = "span",
  className = "",
  trigger = "load",
  delay = 0,
  stagger = 0.07,
  emClassName = "italic text-sand",
}) {
  const ref = useRef(null);
  const plain = text.replace(/\*/g, "").replace(/\n/g, " ");
  const lines = text.split("\n");

  useGsap(
    ({ motion }) => {
      if (!motion || !ref.current) return;
      const words = ref.current.querySelectorAll("[data-word]");
      gsap.set(words, { yPercent: 118 });
      const vars = { yPercent: 0, duration: 1.2, ease: "power4.out", stagger, delay };
      if (trigger === "scroll") {
        gsap.to(words, { ...vars, delay: 0, scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } });
      } else {
        gsap.to(words, vars);
      }
    },
    ref,
    [text, trigger, delay]
  );

  return (
    <Tag ref={ref} className={className} aria-label={plain}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {line.split(" ").filter(Boolean).map((raw, wi, arr) => {
            const emphasised = raw.startsWith("*") && raw.endsWith("*") && raw.length > 2;
            const word = emphasised ? raw.slice(1, -1) : raw;
            return (
              <span key={wi}>
                <span className="inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]">
                  <span data-word className={`inline-block will-change-transform ${emphasised ? emClassName : ""}`}>
                    {word}
                  </span>
                </span>
                {wi < arr.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
