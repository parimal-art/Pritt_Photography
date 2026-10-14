"use client";

import ResourceManager from "@/components/admin/ResourceManager";

/* Client-side configs: functions (titleOf, metaOf…) cannot be passed from Server Components. */

export function CategoriesManager() {
  return (
    <ResourceManager
      endpoint="/api/admin/categories"
      singular="Category"
      plural="Categories"
      subtitle="These are the filters visitors see in the gallery. Order here = order of the filter buttons."
      initial={{ name: "", slug: "", description: "" }}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "slug", label: "Slug", type: "text", hint: "Used in the gallery link, e.g. weddings. Leave empty to create it from the name." },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
      ]}
      titleOf={(c) => c.name}
      metaOf={(c) => `/gallery?category=${c.slug}`}
    />
  );
}

export function ServicesManager() {
  return (
    <ResourceManager
      endpoint="/api/admin/services"
      singular="Service"
      plural="Services"
      subtitle="Shown in the Services section. The optional image appears when a visitor hovers the service."
      initial={{ title: "", description: "", image: null, visible: true }}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "image", label: "Image", type: "image" },
        { name: "visible", label: "Visible on the website", type: "checkbox" },
      ]}
      titleOf={(s) => s.title}
      metaOf={(s) => s.description}
      imageOf={(s) => s.image?.url}
      toggle={{ key: "visible", on: "Visible", off: "Hidden" }}
    />
  );
}

export function TestimonialsManager() {
  return (
    <ResourceManager
      endpoint="/api/admin/testimonials"
      singular="Testimonial"
      plural="Testimonials"
      subtitle="Add genuine client feedback only. Nothing is shown on the website until you publish it."
      initial={{ quote: "", name: "", project: "", published: false }}
      fields={[
        { name: "quote", label: "Quote", type: "textarea", rows: 5 },
        { name: "name", label: "Client name", type: "text" },
        { name: "project", label: "Project (optional)", type: "text", hint: "e.g. Wedding, 2026" },
        { name: "published", label: "Published on the website", type: "checkbox" },
      ]}
      titleOf={(t) => t.name}
      metaOf={(t) => t.quote}
      toggle={{ key: "published", on: "Published", off: "Draft" }}
    />
  );
}

export function ProjectsManager({ categoryOptions, photoOptions }) {
  return (
    <ResourceManager
      endpoint="/api/admin/projects"
      singular="Project"
      plural="Projects"
      subtitle="Projects are visual stories with their own page. Attach photographs to a project when you edit them in the Gallery."
      initial={{ title: "", slug: "", description: "", category: "", date: "", location: "", coverPhoto: "", published: true }}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "slug", label: "Slug", type: "text", hint: "Leave empty to create it from the title." },
        { name: "description", label: "Description", type: "textarea", rows: 4 },
        { name: "category", label: "Category", type: "select", options: categoryOptions },
        { name: "date", label: "Date / year", type: "text", hint: "e.g. 2026" },
        { name: "location", label: "Location", type: "text" },
        { name: "coverPhoto", label: "Cover photograph", type: "select", options: photoOptions },
        { name: "published", label: "Published on the website", type: "checkbox" },
      ]}
      titleOf={(p) => p.title}
      metaOf={(p) => [p.date, p.location, `/projects/${p.slug}`].filter(Boolean).join(" · ")}
      toggle={{ key: "published", on: "Published", off: "Draft" }}
    />
  );
}
