/**
 * Rules + hooks for the simple CRUD resources (categories, projects, services, testimonials).
 * Route files only wire these into the generic handler factories.
 */
import { Category, Photo, Project, Service, Testimonial } from "@/lib/db/models";
import { uniqueSlug } from "@/lib/admin/slug";
import { deleteAssetIfUnused } from "@/lib/admin/assets";

export const CATEGORY = {
  model: Category,
  rules: {
    name: { type: "string", required: true, max: 60, label: "Name" },
    slug: { type: "slug", label: "Slug" },
    description: { type: "text", max: 400, label: "Description" },
  },
  async prepare(data, current) {
    if (data.slug || !current) data.slug = await uniqueSlug(Category, data.slug || data.name, current?._id);
  },
  async beforeDelete(doc) {
    await Photo.updateMany({ categories: doc._id }, { $pull: { categories: doc._id } });
    await Project.updateMany({ category: doc._id }, { $set: { category: null } });
  },
};

export const PROJECT = {
  model: Project,
  rules: {
    title: { type: "string", required: true, max: 120, label: "Title" },
    slug: { type: "slug", label: "Slug" },
    description: { type: "text", max: 2000, label: "Description" },
    category: { type: "objectId", label: "Category" },
    date: { type: "string", max: 20, label: "Date" },
    location: { type: "string", max: 120, label: "Location" },
    coverPhoto: { type: "objectId", label: "Cover photograph" },
    published: { type: "boolean" },
  },
  async prepare(data, current) {
    if (data.slug || !current) data.slug = await uniqueSlug(Project, data.slug || data.title, current?._id);
  },
  async beforeDelete(doc) {
    await Photo.updateMany({ project: doc._id }, { $set: { project: null } });
  },
};

export const SERVICE = {
  model: Service,
  rules: {
    title: { type: "string", required: true, max: 80, label: "Title" },
    description: { type: "text", max: 600, label: "Description" },
    image: { type: "image", label: "Image" },
    visible: { type: "boolean" },
  },
  async afterSave(before, current) {
    if (before.image?.publicId && before.image.publicId !== current.image?.publicId) await deleteAssetIfUnused(before.image.publicId);
  },
  async afterDelete(doc) {
    if (doc.image?.publicId) await deleteAssetIfUnused(doc.image.publicId);
  },
};

export const TESTIMONIAL = {
  model: Testimonial,
  rules: {
    quote: { type: "text", required: true, max: 1200, label: "Quote" },
    name: { type: "string", required: true, max: 80, label: "Name" },
    project: { type: "string", max: 120, label: "Project" },
    published: { type: "boolean" },
  },
};

export const PHOTO_RULES = {
  title: { type: "string", required: true, max: 160, label: "Title" },
  caption: { type: "string", max: 300, label: "Caption" },
  description: { type: "text", max: 2000, label: "Description" },
  alt: { type: "string", max: 300, label: "Alt text" },
  categories: { type: "objectIds", label: "Categories" },
  project: { type: "objectId", label: "Project" },
  featured: { type: "boolean" },
  published: { type: "boolean" },
  location: { type: "string", max: 120, label: "Location" },
  takenAt: { type: "string", max: 20, label: "Date" },
};

