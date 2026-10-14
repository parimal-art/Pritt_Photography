import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getProject } from "@/lib/db/queries";
import SplitText from "@/components/animations/SplitText";
import MaskImage from "@/components/animations/MaskImage";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.description || undefined };
}

const SPANS = [
  "md:col-span-12",
  "md:col-span-5 md:col-start-2",
  "md:col-span-5 md:col-start-8 md:mt-32",
  "md:col-span-8",
  "md:col-span-4 md:mt-48",
  "md:col-span-6 md:col-start-4",
];
const DIRECTIONS = ["up", "left", "right", "up", "right", "left"];

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <article className="px-6 pb-24 pt-36 md:px-14 md:pt-44">
      <div className="mx-auto max-w-[1800px]">
        <Link href="/#projects" className="link-underline inline-flex items-center gap-3 py-2 text-[11px] font-semibold uppercase tracking-caps text-mute hover:text-bone">
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" /> All projects
        </Link>

        <header className="mt-12 grid gap-10 md:grid-cols-12">
          <h1 className="font-serif text-[clamp(56px,9vw,150px)] font-normal leading-[0.9] tracking-[-0.02em] md:col-span-8">
            <SplitText text={project.title} />
          </h1>
          <dl className="grid content-end gap-5 text-[11px] font-semibold uppercase tracking-caps md:col-span-4">
            {project.categoryLabel ? (
              <div>
                <dt className="text-mute">Category</dt>
                <dd className="mt-1">{project.categoryLabel}</dd>
              </div>
            ) : null}
            {project.date ? (
              <div>
                <dt className="text-mute">Year</dt>
                <dd className="mt-1">{project.date}</dd>
              </div>
            ) : null}
            {project.location ? (
              <div>
                <dt className="text-mute">Location</dt>
                <dd className="mt-1">{project.location}</dd>
              </div>
            ) : null}
          </dl>
        </header>

        {project.description ? <p className="mt-12 max-w-2xl text-[19px] leading-[1.8] text-ash">{project.description}</p> : null}

        <div className="mt-24 grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-12">
          {project.photos.length ? (
            project.photos.map((photo, i) => (
              <figure key={photo.id} className={SPANS[i % SPANS.length]}>
                <MaskImage photo={photo} direction={DIRECTIONS[i % DIRECTIONS.length]} sizes="(max-width: 768px) 100vw, 70vw" priority={i === 0} />
                <figcaption className="mt-4 text-[11px] font-semibold uppercase tracking-caps text-mute">
                  {photo.title}
                  {photo.location ? ` — ${photo.location}` : ""}
                </figcaption>
              </figure>
            ))
          ) : (
            <p className="py-24 text-center text-mute md:col-span-12">Photographs for this project are coming soon.</p>
          )}
        </div>

        {project.next && project.next.slug !== project.slug ? (
          <Link href={`/projects/${project.next.slug}`} data-cursor="Next" className="group mt-32 block border-t border-line pt-10">
            <span className="text-[11px] font-semibold uppercase tracking-caps text-mute">Next project</span>
            <span className="mt-4 flex flex-wrap items-center justify-between gap-6">
              <span className="font-serif text-[clamp(40px,6vw,96px)] leading-none transition-colors group-hover:text-gilt">{project.next.title}</span>
              <ArrowRight size={36} strokeWidth={1.2} className="transition-transform duration-500 group-hover:translate-x-2" aria-hidden="true" />
            </span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
