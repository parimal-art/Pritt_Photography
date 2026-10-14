/**
 * Read-side queries for the PUBLIC website (server only).
 *
 * - Only published content is ever returned.
 * - Results are cached (tag "content", 60 s) and revalidated the moment the admin saves.
 * - If MongoDB is not configured / unreachable, pages still render with safe defaults
 *   instead of crashing (the failure is logged, and failures are never cached).
 */
import { unstable_cache } from "next/cache";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { Category, Photo, Project, Service, Setting, Testimonial } from "@/lib/db/models";
import { plain } from "@/lib/db/serialize";
import { CONTENT_TAG } from "@/lib/admin/revalidate";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { escapeRegex, slugify } from "@/lib/validation";

const cached = (fn, key) => unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: 60 });

async function safe(fn, fallback) {
  if (!isDbConfigured()) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error("[queries]", err?.message || err);
    return fallback;
  }
}

/** Shape consumed by every photo component (grid, lightbox, hero, featured…). */
function toPhoto(p, cats, projects) {
  const first = (p.categories || []).map((id) => cats.get(String(id))).find(Boolean);
  const project = p.project ? projects?.get(String(p.project)) : null;
  return {
    id: String(p._id),
    src: p.url,
    width: p.width,
    height: p.height,
    title: p.title,
    caption: p.caption || "",
    alt: p.alt || p.title,
    category: first?.slug || "",
    categoryLabel: first?.name || "",
    featured: Boolean(p.featured),
    project: project?.slug || "",
    date: p.takenAt || "",
    location: p.location || "",
  };
}

async function categoryMap() {
  const cats = await Category.find().sort({ order: 1 }).lean();
  return { list: cats, map: new Map(cats.map((c) => [String(c._id), { name: c.name, slug: c.slug }])) };
}

/* ------------------------------ settings ------------------------------ */

const loadSettings = cached(async () => {
  await connectDB();
  const doc = await Setting.findOne({ key: "site" }).lean();
  return { ...DEFAULT_SETTINGS, ...(plain(doc) || {}) };
}, "settings");

export const getSettings = () => safe(loadSettings, DEFAULT_SETTINGS);

/* ------------------------------ gallery ------------------------------- */

const loadCategories = cached(async () => {
  await connectDB();
  const { list } = await categoryMap();
  const counts = await Photo.aggregate([
    { $match: { published: true } },
    { $unwind: "$categories" },
    { $group: { _id: "$categories", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  const total = await Photo.countDocuments({ published: true });
  return {
    total,
    categories: list
      .map((c) => ({ id: String(c._id), name: c.name, slug: c.slug, description: c.description || "", count: byId.get(String(c._id)) || 0 }))
      .filter((c) => c.count > 0),
  };
}, "categories");

export const getCategories = () => safe(loadCategories, { total: 0, categories: [] });

const loadPhotosPage = cached(async (categorySlug, q, page, perPage) => {
  await connectDB();
  const { list, map } = await categoryMap();
  const filter = { published: true };
  let category = "all";
  if (categorySlug && categorySlug !== "all") {
    const cat = list.find((c) => c.slug === categorySlug);
    category = cat ? cat.slug : "all";
    if (cat) filter.categories = cat._id;
  }
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };

  const total = await Photo.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const rows = await Photo.find(filter).sort({ order: 1, createdAt: 1 }).skip((safePage - 1) * perPage).limit(perPage).lean();
  const projects = new Map((await Project.find().select("slug").lean()).map((p) => [String(p._id), { slug: p.slug }]));
  return { items: rows.map((r) => toPhoto(r, map, projects)), total, page: safePage, totalPages, perPage, category, q };
}, "photos-page");

export async function getPhotosPage({ category = "all", q = "", page = 1, perPage = 12 } = {}) {
  const per = Math.min(Math.max(parseInt(perPage, 10) || 12, 1), 60);
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const slug = slugify(category) || "all";
  const search = String(q || "").trim().slice(0, 80);
  let error = false;
  const data = await safe(() => loadPhotosPage(slug, search, pg, per), null);
  if (!data) error = isDbConfigured();
  return data ? { ...data, error: false } : { items: [], total: 0, page: 1, totalPages: 1, perPage: per, category: "all", q: search, error };
}

/* ----------------------------- featured / hero ------------------------ */

const loadFeatured = cached(async (limit) => {
  await connectDB();
  const { map } = await categoryMap();
  const rows = await Photo.find({ published: true, featured: true }).sort({ featuredOrder: 1, createdAt: 1 }).limit(limit).lean();
  return rows.map((r) => toPhoto(r, map, null));
}, "featured");

export const getFeaturedPhotos = (limit = 8) => safe(() => loadFeatured(limit), []);

/* ------------------------------ projects ------------------------------ */

const loadProjects = cached(async () => {
  await connectDB();
  const { map } = await categoryMap();
  const projects = await Project.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
  const photos = await Photo.find({ published: true, project: { $in: projects.map((p) => p._id) } }).sort({ order: 1, createdAt: 1 }).lean();
  const slugs = new Map(projects.map((p) => [String(p._id), { slug: p.slug }]));
  return projects.map((p) => {
    const mine = photos.filter((ph) => String(ph.project) === String(p._id)).map((ph) => toPhoto(ph, map, slugs));
    const cover = mine.find((ph) => ph.id === String(p.coverPhoto)) || mine[0] || null;
    const cat = p.category ? map.get(String(p.category)) : null;
    return {
      id: String(p._id), slug: p.slug, title: p.title, description: p.description || "", date: p.date || "",
      location: p.location || "", categoryLabel: cat?.name || "", category: cat?.slug || "", cover, photos: mine, count: mine.length,
    };
  });
}, "projects");

export const getProjects = () => safe(loadProjects, []);

export async function getProject(slug) {
  const all = await getProjects();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  return { ...all[i], next: all.length > 1 ? all[(i + 1) % all.length] : null };
}

/* ------------------------ services / testimonials --------------------- */

const loadServices = cached(async () => {
  await connectDB();
  return (await Service.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean()).map(plain);
}, "services");
export const getServices = () => safe(loadServices, []);

const loadTestimonials = cached(async () => {
  await connectDB();
  return (await Testimonial.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean()).map(plain);
}, "testimonials");
export const getTestimonials = () => safe(loadTestimonials, []);
