"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Sun/moon switch. Both icons are always rendered and shown/hidden with CSS
 * (`dark:` variant = <html data-theme="dark">), so there is no hydration mismatch.
 * The choice is saved in localStorage ("pp-theme") and applied before paint by
 * the inline script in app/layout.js.
 */
export default function ThemeToggle({ className = "" }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.classList.add("theme-transition");
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pp-theme", next);
    } catch {
      /* private mode: the theme still changes for this visit */
    }
    window.setTimeout(() => root.classList.remove("theme-transition"), 600);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      className={`flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70 ${className}`}
    >
      <Sun size={20} strokeWidth={1.4} className="hidden dark:block" aria-hidden="true" />
      <Moon size={20} strokeWidth={1.4} className="block dark:hidden" aria-hidden="true" />
    </button>
  );
}
