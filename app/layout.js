import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/db/queries";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata() {
  const s = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const description = s.heroDescription || `${s.brandName} — photography portfolio.`;
  return {
    metadataBase: new URL(base),
    title: { default: s.brandName, template: `%s — ${s.brandName}` },
    description,
    openGraph: {
      title: s.brandName,
      description,
      type: "website",
      images: s.heroImage?.url ? [{ url: s.heroImage.url, width: s.heroImage.width, height: s.heroImage.height }] : undefined,
    },
  };
}

export const viewport = { themeColor: "#0a0a0a" };

/**
 * Runs before first paint: saved choice -> admin's default theme -> OS preference -> dark.
 * This is what prevents a flash of the wrong theme and any hydration mismatch.
 */
function themeScript(defaultTheme) {
  return `(function(){try{var s=localStorage.getItem("pp-theme");var d=${JSON.stringify(defaultTheme)};var t=(s==="dark"||s==="light")?s:(d==="dark"||d==="light")?d:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`;
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(settings.defaultTheme) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
