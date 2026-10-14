import { connectDB } from "@/lib/db/connect";
import { Category, Photo } from "@/lib/db/models";
import { ProjectsManager } from "@/components/admin/managers";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await connectDB();
  const [cats, photos] = await Promise.all([
    Category.find().sort({ order: 1 }).select("name").lean(),
    Photo.find().sort({ order: 1 }).limit(500).select("title").lean(),
  ]);
  const categoryOptions = [{ value: "", label: "— None —" }, ...cats.map((c) => ({ value: String(c._id), label: c.name }))];
  const photoOptions = [{ value: "", label: "— First photograph of the project —" }, ...photos.map((p) => ({ value: String(p._id), label: p.title }))];

  return <ProjectsManager categoryOptions={categoryOptions} photoOptions={photoOptions} />;
}
