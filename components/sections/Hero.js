"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Globe } from "lucide-react";
import { gsap, useGsap } from "@/lib/gsap";
import SplitText from "@/components/animations/SplitText";
import Magnetic from "@/components/animations/Magnetic";
import PhotoImage from "@/components/ui/PhotoImage";

/** "A\nB\nC." -> "A\nB\n*C.*" — the last line is set in italic champagne. */
function emphasiseLastLine(text) {
  const lines = String(text || "").split("\n").filter(Boolean);
  if (lines.length < 2) return lines.join("");
  const last = lines.pop().split(" ").filter(Boolean).map((w) => `*${w}*`).join(" ");
  return [...lines, last].join("\n");
}

/**
 * Full-screen cinematic hero using the photograph uploaded in Admin → Settings.
 * Fixed light text on a dark scrim keeps it readable in BOTH themes.
 */
export default function Hero({ settings }) {
  const root = useRef(null);
  const { heroImage, heroPosition, heroHeadline, heroDescription, heroEyebrow, ownerName, location, availability } = settings;
  const photo = heroImage ? { src: heroImage.url, width: heroImage.width, height: heroImage.height, alt: `${settings.brandName} — featured photograph` } : null;
  const objectPosition = `${heroPosition?.x ?? 50}% ${heroPosition?.y ?? 50}%`;

  useGsap(
    ({ motion, fine }) => {
      if (!motion || !root.current) return;
      const el = root.current;
      gsap.fromTo(el.querySelector("[data-hero-zoom]"), { scale: 1.18 }, { scale: 1.02, duration: 9, ease: "power2.out" });
      gsap.from(el.querySelectorAll("[data-hero-in]"), { y: 28, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.14, delay: 1.0 });
      gsap.to(el.querySelector("[data-hero-content]"), { yPercent: -14, opacity: 0, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom 30%", scrub: true } });
      gsap.to(el.querySelector("[data-hero-shade]"), { opacity: 0.85, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });

      if (fine) {
        const bg = el.querySelector("[data-hero-parallax]");
        const bgX = gsap.quickTo(bg, "x", { duration: 1.4, ease: "power3.out" });
        const bgY = gsap.quickTo(bg, "y", { duration: 1.4, ease: "power3.out" });
        const fgX = gsap.quickTo(el.querySelector("[data-hero-content]"), "x", { duration: 1.1, ease: "power3.out" });
        const onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          bgX(nx * -36);
          bgY(ny * -24);
          fgX(nx * 14);
        };
        el.addEventListener("pointermove", onMove);
        return () => el.removeEventListener("pointermove", onMove);
      }
    },
    root,
    []
  );

  return (
    <section ref={root} id="top" className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#0A0A0A] text-[#F5F0E8]">
      <div data-hero-parallax className="absolute -inset-10 -z-10">
        <div data-hero-zoom className="h-full w-full will-change-transform">
          {photo ? <PhotoImage photo={photo} priority sizes="100vw" quality={85} ratio={false} objectPosition={objectPosition} /> : null}
        </div>
      </div>
      {/* legibility scrim: darker on the text side, photograph stays visible on the right */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0A0A0A]/85 via-[#0A0A0A]/35 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0A0A0A]/70 via-transparent to-[#0A0A0A]/30" aria-hidden="true" />
      <div data-hero-shade className="absolute inset-0 -z-10 bg-[#0A0A0A] opacity-0" aria-hidden="true" />

      <div data-hero-content className="mx-auto w-full max-w-[1800px] px-6 pb-12 pt-40 md:px-14 md:pb-16">
        <p data-hero-in className="text-[11px] font-semibold uppercase tracking-caps text-[#D9BD8C]">
          {heroEyebrow}
          {ownerName ? ` — ${ownerName}` : ""}
        </p>

        <h1 className="mt-8 font-serif text-[clamp(60px,10.5vw,176px)] font-normal leading-[0.9] tracking-[-0.02em]">
          <SplitText text={emphasiseLastLine(heroHeadline)} delay={0.35} emClassName="italic text-[#E3CDA3]" />
        </h1>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-md">
            <p data-hero-in className="text-[17px] leading-[1.75] text-[#F5F0E8]/85">
              {heroDescription}
            </p>
            <div data-hero-in className="mt-8">
              <Magnetic>
                <Link href="/gallery" data-cursor="Open" className="inline-flex min-h-[48px] items-center gap-3 border border-[#F5F0E8] px-8 py-4 text-[12px] font-semibold uppercase tracking-caps transition-colors duration-500 hover:bg-[#F5F0E8] hover:text-[#0A0A0A]">
                  Explore work
                  <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Magnetic>
            </div>
          </div>

          <div data-hero-in className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-caps text-[#F5F0E8]/75">
            {location ? (
              <span className="flex items-center gap-3">
                <MapPin size={14} strokeWidth={1.5} aria-hidden="true" /> Based in {location}
              </span>
            ) : null}
            {availability ? (
              <span className="flex items-center gap-3">
                <Globe size={14} strokeWidth={1.5} aria-hidden="true" /> {availability}
              </span>
            ) : null}
          </div>
        </div>

        <div data-hero-in className="mt-12 flex items-center gap-5 text-[11px] font-semibold uppercase tracking-caps text-[#F5F0E8]/70">
          <span className="relative block h-14 w-px overflow-hidden bg-[#F5F0E8]/25" aria-hidden="true">
            <span className="absolute inset-x-0 top-0 h-6 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-[#F5F0E8]" />
          </span>
          Scroll
        </div>
      </div>

      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(300%)}}`}</style>
    </section>
  );
}
