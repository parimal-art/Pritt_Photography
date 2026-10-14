import { getProjects } from "@/lib/db/queries";

export const revalidate = 3600;

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const projects = await getProjects();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/gallery`, changeFrequency: "weekly", priority: 0.9 },
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, changeFrequency: "monthly", priority: 0.7 })),
  ];
}
