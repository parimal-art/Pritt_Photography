"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { gsap, useGsap } from "@/lib/gsap";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Navigation({ brand, availability, items }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > lastY.current && y > 240);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useGsap(
    ({ motion: ok }) => {
      if (!ok || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll("[data-nav-item]"), { y: -18, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.2 });
    },
    headerRef,
    []
  );

  // Over the full-screen hero photograph the bar stays transparent with fixed light text;
  // everywhere else it uses the theme colours.
  const overHero = pathname === "/" && !solid && !open;
  const isActive = (href) => (href === "/gallery" ? pathname.startsWith("/gallery") : false);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color] duration-500 ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${overHero ? "border-transparent bg-transparent text-[#F5F0E8]" : "border-line bg-ink/95 text-bone"}`}
      >
        <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-6 md:px-14">
          <Link href="/" data-nav-item className="font-serif text-[26px] leading-none tracking-tight md:text-[30px]" aria-label={`${brand} — home`}>
            {brand}
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                data-nav-item
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`link-underline py-2 text-[11px] font-semibold uppercase tracking-caps transition-colors ${
                  isActive(item.href) ? (overHero ? "text-[#D9BD8C]" : "text-gilt") : "opacity-90 hover:opacity-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {availability ? (
              <span data-nav-item className="mr-3 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-caps opacity-80 xl:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-sand" aria-hidden="true" />
                {availability}
              </span>
            ) : null}
            <span data-nav-item>
              <ThemeToggle />
            </span>
            <button
              ref={menuButtonRef}
              type="button"
              data-nav-item
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-11 w-11 items-center justify-center lg:hidden"
            >
              {open ? <X size={26} strokeWidth={1.4} /> : <Menu size={26} strokeWidth={1.4} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-ink px-6 pb-10 pt-28 text-bone lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col border-t border-line">
              {items.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={item.href} onClick={() => setOpen(false)} className="flex items-baseline gap-5 border-b border-line py-5">
                    <span className="w-7 text-[12px] tracking-caps text-mute">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-serif text-[44px] leading-none">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
