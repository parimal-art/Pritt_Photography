import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SplitText from "@/components/animations/SplitText";
import ScrollWords from "@/components/animations/ScrollWords";
import MaskImage from "@/components/animations/MaskImage";
import Magnetic from "@/components/animations/Magnetic";

export default function About({ settings }) {
  const { aboutImage, aboutStatement, aboutParagraphs = [], stats = [], ownerName, brandName } = settings;
  const portrait = aboutImage ? { src: aboutImage.url, width: aboutImage.width, height: aboutImage.height, alt: `Portrait of ${ownerName || brandName}` } : null;
  if (!aboutStatement && !aboutParagraphs.length && !portrait) return null;

  return (
    <section id="about" className="scroll-mt-20 border-y border-line bg-char px-6 py-28 md:px-14 md:py-44">
      <div className="mx-auto flex max-w-[1800px] flex-wrap gap-x-20 gap-y-16">
        {portrait ? (
          <div className="w-full max-w-[420px] flex-none md:mt-16">
            <MaskImage photo={portrait} direction="right" sizes="(max-width: 768px) 90vw, 420px" parallax={5} />
            {ownerName ? <p className="mt-4 text-[11px] font-semibold uppercase tracking-caps text-mute">{ownerName}</p> : null}
          </div>
        ) : null}

        <div className="min-w-0 flex-1 basis-[520px]">
          <p className="eyebrow">01 — About</p>
          {aboutStatement ? (
            <h2 className="mt-8 font-serif text-[clamp(38px,4.8vw,76px)] font-normal leading-[1.05] tracking-[-0.01em]">
              <SplitText text={aboutStatement} trigger="scroll" stagger={0.04} />
            </h2>
          ) : null}

          {aboutParagraphs.length ? (
            <div className="mt-14 grid max-w-3xl gap-10 md:grid-cols-2">
              {aboutParagraphs.map((p, i) => (
                <ScrollWords key={i} text={p} className="text-[16px] leading-[1.85] text-ash" />
              ))}
            </div>
          ) : null}

          {stats.length ? (
            <dl className="mt-14 flex max-w-3xl flex-wrap gap-x-16 gap-y-8 border-t border-line pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="font-serif text-[60px] leading-none">{s.value}</dd>
                  <dt className="mt-2 text-[11px] font-semibold uppercase tracking-caps text-mute">{s.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-14">
            <Magnetic>
              <Link href="/#portfolio" data-cursor="Go" className="link-underline inline-flex items-center gap-4 border-b border-sand py-3 text-[12px] font-semibold uppercase tracking-caps">
                Discover my work
                <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
