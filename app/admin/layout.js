export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/** The admin area has no public navigation, footer or cursor — and nothing on the site links here. */
export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-ink font-sans text-bone">{children}</div>;
}
