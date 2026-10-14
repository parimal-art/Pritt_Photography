"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop({ className = "" }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`group inline-flex min-h-[44px] items-center gap-3 text-[12px] uppercase tracking-caps text-mute transition-colors hover:text-bone ${className}`}
    >
      Back to top
      <ArrowUp size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-translate-y-1" aria-hidden="true" />
    </button>
  );
}
