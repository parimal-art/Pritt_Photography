import Link from "next/link";
import { connectDB } from "@/lib/db/connect";
import { Category, Message, Photo, Project } from "@/lib/db/models";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { PageHeader } from "@/components/admin/ui";

/** All numbers are counted from real database records. */
export default async function DashboardPage() {
  await connectDB();
  const [total, published, featured, categories, projects, unread] = await Promise.all([
    Photo.countDocuments(),
    Photo.countDocuments({ published: true }),
    Photo.countDocuments({ featured: true }),
    Category.countDocuments(),
    Project.countDocuments(),
    Message.countDocuments({ read: false }),
  ]);
  const cards = [
    { label: "Total photographs", value: total, href: "/admin/dashboard/gallery" },
    { label: "Published", value: published, href: "/admin/dashboard/gallery" },
    { label: "Drafts", value: total - published, href: "/admin/dashboard/gallery" },
    { label: "Featured", value: featured, href: "/admin/dashboard/featured" },
    { label: "Categories", value: categories, href: "/admin/dashboard/categories" },
    { label: "Projects", value: projects, href: "/admin/dashboard/projects" },
    { label: "Unread messages", value: unread, href: "/admin/dashboard/messages" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A live overview of your portfolio." />
      {!isCloudinaryConfigured() ? (
        <p role="alert" className="mb-8 border border-danger p-4 text-[14px] text-danger">
          Cloudinary keys are missing on the server, so photograph uploads are disabled. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your environment.
        </p>
      ) : null}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block border border-line bg-char p-6 transition-colors hover:border-sand">
              <p className="font-serif text-[56px] leading-none">{c.value}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-caps text-mute">{c.label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-12 max-w-2xl border border-line bg-char p-6">
        <h2 className="font-serif text-[26px]">Quick start</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-ash">
          <li>Settings: upload your hero image, add your name, biography and contact details.</li>
          <li>Gallery: upload photographs, assign categories and arrange their order.</li>
          <li>Featured Work: choose which photographs appear on the home page.</li>
        </ol>
      </section>
    </>
  );
}
