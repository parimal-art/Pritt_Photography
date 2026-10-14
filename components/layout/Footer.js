import Link from "next/link";
import BackToTop from "@/components/ui/BackToTop";

export default function Footer({ settings, items }) {
  const year = new Date().getFullYear();
  const socials = (settings.socials || []).filter((s) => s.url);

  return (
    <footer className="border-t border-line px-6 py-14 md:px-14">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-start justify-between gap-x-12 gap-y-10">
        <div className="flex max-w-sm flex-col gap-3">
          <span className="font-serif text-[34px] leading-none">{settings.brandName}</span>
          {settings.footerText ? <p className="text-[14px] leading-relaxed text-mute">{settings.footerText}</p> : null}
          {settings.location ? <span className="text-[11px] font-semibold uppercase tracking-caps text-mute">{settings.location}</span> : null}
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-1 text-[11px] font-semibold uppercase tracking-caps text-mute">
          {items.filter((n) => n.label !== "Home").map((item) => (
            <Link key={item.label} href={item.href} className="py-2 transition-colors hover:text-bone">
              {item.label}
            </Link>
          ))}
        </nav>

        {socials.length ? (
          <ul className="flex flex-wrap gap-x-8 gap-y-1 text-[11px] font-semibold uppercase tracking-caps text-mute">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 transition-colors hover:text-bone">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <BackToTop />
      </div>
      <div className="mx-auto mt-12 max-w-[1800px] border-t border-line pt-6 text-[11px] font-semibold uppercase tracking-caps text-mute">
        © {year} {settings.brandName}. All photographs are protected by copyright.
      </div>
    </footer>
  );
}
