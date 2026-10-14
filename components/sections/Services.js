"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGsap } from "@/lib/gsap";
import SplitText from "@/components/animations/SplitText";
import PhotoImage from "@/components/ui/PhotoImage";

/**
 * Services as a typographic index. Hovering a row (fine pointers) reveals a
 * cursor-following photograph; the other rows dim. On touch devices the rows are
 * simple links.
 */
export default function Services({ services = [] }) {
  const root = useRef(null);
  const preview = useRef(null);
  const [active, setActive] = useState(-1);

  useGsap(
    ({ motion, fine }) => {
      if (!root.current) return;
      const cleanups = [];

      if (motion) {
        // Rule lines draw in, rows slide up — this section's own motion identity.
        gsap.set("[data-rule]", { scaleX: 0, transformOrigin: "left center" });
        gsap.set("[data-row-inner]", { yPercent: 40, opacity: 0 });
        gsap.to("[data-rule]", {
          scaleX: 1,
          duration: 1.4,
          ease: "power4.inOut",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-list]", start: "top 80%", once: true },
        });
        gsap.to("[data-row-inner]", {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-list]", start: "top 80%", once: true },
        });
      }

      if (motion && fine && preview.current) {
        gsap.set(preview.current, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.85 });
        const x = gsap.quickTo(preview.current, "x", { duration: 0.6, ease: "power3" });
        const y = gsap.quickTo(preview.current, "y", { duration: 0.6, ease: "power3" });
        const list = root.current.querySelector("[data-list]");
        const move = (e) => {
          x(e.clientX + 120);
          y(e.clientY);
        };
        list.addEventListener("pointermove", move);
        cleanups.push(() => list.removeEventListener("pointermove", move));
      }

      return () => cleanups.forEach((fn) => fn());
    },
    root,
    []
  );

  // Show / hide the floating preview
  useEffect(() => {
    if (!preview.current) return;
    gsap.to(preview.current, {
      opacity: active >= 0 ? 1 : 0,
      scale: active >= 0 ? 1 : 0.85,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [active]);

  const activeService = active >= 0 ? services[active] : null;
  const current = activeService?.image ? { id: activeService.id, src: activeService.image.url, width: activeService.image.width, height: activeService.image.height, alt: "" } : null;

  return (
    <section ref={root} id="services" className="scroll-mt-20 border-y border-line bg-char px-6 py-28 md:px-14 md:py-44">
      <div className="mx-auto flex max-w-[1800px] flex-wrap gap-x-20 gap-y-14">
        <div className="w-full max-w-[380px] flex-none">
          <p className="eyebrow">04 — Services</p>
          <h2 className="mt-6 font-serif text-[clamp(48px,6vw,92px)] font-normal leading-[0.95] tracking-[-0.02em]">
            <SplitText text={"What I\n*make*"} trigger="scroll" />
          </h2>
          <p className="mt-8 max-w-xs text-[17px] leading-[1.75] text-ash">
            Every commission starts with a conversation — the story, the place, the light — and ends with a considered set of photographs.
          </p>
        </div>

        <ul data-list className="group/list min-w-0 flex-1 basis-[520px]">
          {services.map((s, i) => {
            const href = "/#contact";
            return (
              <li
                key={s.id}
                className="relative transition-opacity duration-500 group-hover/list:opacity-30 hover:!opacity-100 focus-within:!opacity-100"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(-1)}
              >
                <span data-rule className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden="true" />
                <Link href={href} className="block overflow-hidden py-9" onFocus={() => setActive(i)} onBlur={() => setActive(-1)}>
                  <span data-row-inner className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
                    <span className="w-10 text-[12px] tracking-caps text-mute">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-[200px] flex-1 font-serif text-[clamp(36px,3.8vw,60px)] leading-[1.05]">{s.title}</span>
                    <span className="max-w-sm flex-1 basis-[240px] text-[15px] leading-relaxed text-mute">{s.description}</span>
                    <ArrowUpRight size={22} strokeWidth={1.3} className="text-mute" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
          <li aria-hidden="true" className="relative h-px">
            <span data-rule className="absolute inset-x-0 top-0 h-px bg-line" />
          </li>
        </ul>
      </div>

      <div ref={preview} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-30 hidden w-[260px] opacity-0 [@media(hover:hover)_and_(pointer:fine)]:block">
        {current ? <PhotoImage key={current.id} photo={current} sizes="260px" className="aspect-[4/5]" /> : null}
      </div>
    </section>
  );
}
