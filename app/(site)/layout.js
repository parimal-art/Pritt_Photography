import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/animations/CustomCursor";
import { getSettings } from "@/lib/db/queries";
import { NAV } from "@/lib/defaults";

/** Public website chrome. The admin area (app/admin) deliberately does not use it. */
export default async function SiteLayout({ children }) {
  const s = await getSettings();
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-bone px-4 py-3 text-[12px] font-semibold uppercase tracking-caps text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <Navigation brand={s.brandName} availability={s.availability} items={NAV} />
      <main id="main">{children}</main>
      <Footer settings={s} items={NAV} />
      <CustomCursor />
    </>
  );
}
