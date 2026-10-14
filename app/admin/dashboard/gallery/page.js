import { connectDB } from "@/lib/db/connect";
import { Category, Project } from "@/lib/db/models";
import GalleryManager from "@/components/admin/GalleryManager";

export const metadata = { title: "Gallery management" };

export default async function GalleryAdminPage() {
  await connectDB();
  const [cats, projects] = await Promise.all([
    Category.find().sort({ order: 1 }).select("name").lean(),
    Project.find().sort({ order: 1 }).select("title").lean(),
  ]);
  return (
    <GalleryManager
      categories={cats.map((c) => ({ id: String(c._id), name: c.name }))}
      projects={projects.map((p) => ({ id: String(p._id), title: p.title }))}
    />
  );
}
