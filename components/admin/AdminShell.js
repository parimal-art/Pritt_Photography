"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderTree, Images, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote, Settings, Sparkles, Star, X, Briefcase } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { api } from "@/components/admin/api";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/admin/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/dashboard/featured", label: "Featured Work", icon: Star },
  { href: "/admin/dashboard/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/dashboard/services", label: "Services", icon: Sparkles },
  { href: "/admin/dashboard/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/dashboard/messages", label: "Contact Messages", icon: Mail },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ email, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await api("/api/admin/auth/logout", { method: "POST", body: {} });
    } catch {
      /* the cookie may already be invalid */
    }
    router.replace("/admin");
    router.refresh();
  }

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] items-center gap-3 border-l-2 px-4 text-[13px] font-semibold tracking-wide transition-colors ${
              active ? "border-sand bg-ink text-bone" : "border-transparent text-mute hover:text-bone"
            }`}
          >
            <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <button type="button" onClick={logout} disabled={busy} className="mt-4 flex min-h-[44px] items-center gap-3 border-l-2 border-transparent px-4 text-left text-[13px] font-semibold tracking-wide text-mute hover:text-bone disabled:opacity-50">
        <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
        {busy ? "Signing out…" : "Logout"}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 flex-none border-r border-line bg-char lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-between overflow-y-auto py-8">
          <div>
            <p className="px-4 font-serif text-[28px] leading-none">Studio</p>
            <p className="mb-8 mt-1 px-4 text-[11px] uppercase tracking-caps text-mute">Admin panel</p>
            {nav}
          </div>
          <div className="flex items-center justify-between px-4">
            <span className="truncate text-[12px] text-mute" title={email}>
              {email}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex h-16 items-center justify-between border-b border-line bg-char px-4 lg:hidden">
          <p className="font-serif text-[24px]">Studio</p>
          <div className="flex items-center">
            <ThemeToggle />
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Close admin menu" : "Open admin menu"} className="flex h-11 w-11 items-center justify-center">
              {open ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
        {open ? <div className="border-b border-line bg-char py-3 lg:hidden">{nav}</div> : null}
        <main className="mx-auto max-w-[1500px] p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}
