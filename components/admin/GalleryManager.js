"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Pencil, Search, Star, Trash2, UploadCloud } from "lucide-react";
import { ACCEPT, api, checkFile, thumb, uploadToCloudinary } from "@/components/admin/api";
import { ConfirmModal, Field, Modal, Notice, PageHeader } from "@/components/admin/ui";

const PER_PAGE = 24;

export default function GalleryManager({ categories, projects }) {
  const [items, setItems] = useState(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const dragId = useRef(null);
  const filtered = Boolean(q || category || status);

  const say = (text, kind = "ok") => {
    setNotice({ text, kind });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const load = useCallback(
    async (page = 1) => {
      try {
        const params = new URLSearchParams({ page: String(page), perPage: String(PER_PAGE) });
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        if (status) params.set("status", status);
        const res = await api(`/api/admin/photos?${params}`);
        setItems(res.items);
        setMeta({ total: res.total, page: res.page, totalPages: res.totalPages });
        setError("");
      } catch (err) {
        setError(err.message);
      }
    },
    [q, category, status]
  );

  useEffect(() => {
    const t = window.setTimeout(() => load(1), q ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, q]);

  async function persistOrder(next) {
    setItems(next);
    try {
      await api("/api/admin/photos/reorder", { method: "POST", body: { ids: next.map((p) => p.id) } });
    } catch (err) {
      say(err.message, "error");
      load(meta.page);
    }
  }

  function swap(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persistOrder(next);
  }

  function dropOn(targetId) {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId) return;
    const next = [...items];
    const a = next.findIndex((p) => p.id === from);
    const b = next.findIndex((p) => p.id === targetId);
    if (a < 0 || b < 0) return;
    const [moved] = next.splice(a, 1);
    next.splice(b, 0, moved);
    persistOrder(next);
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/admin/photos/${deleting.id}`, { method: "DELETE" });
      say("Photograph deleted.");
      setDeleting(null);
      load(meta.page);
    } catch (err) {
      say(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function quickToggle(photo, key) {
    try {
      const res = await api(`/api/admin/photos/${photo.id}`, { method: "PATCH", body: { [key]: !photo[key] } });
      setItems((list) => list.map((p) => (p.id === photo.id ? res.item : p)));
    } catch (err) {
      say(err.message, "error");
    }
  }

  const catName = (id) => categories.find((c) => c.id === id)?.name;

  return (
    <>
      <PageHeader title="Gallery" subtitle={`${meta.total} photograph${meta.total === 1 ? "" : "s"}. Drag cards (or use the arrows) to set the display order on your website.`}>
        <button type="button" className="a-btn-primary" onClick={() => setUploading(true)}>
          <UploadCloud size={16} strokeWidth={1.8} /> Upload photographs
        </button>
      </PageHeader>
      <Notice notice={notice} />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor="g-q" className="sr-only">
            Search by title
          </label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input id="g-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title" className="a-input pl-9" />
        </div>
        <div>
          <label htmlFor="g-cat" className="sr-only">
            Category
          </label>
          <select id="g-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="a-input">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="g-status" className="sr-only">
            Status
          </label>
          <select id="g-status" value={status} onChange={(e) => setStatus(e.target.value)} className="a-input">
            <option value="">Published + drafts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : items === null ? (
        <p className="text-mute">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center text-mute">
          {filtered ? "No photographs match these filters." : "No photographs yet — upload your first one."}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {items.map((p, i) => (
            <li
              key={p.id}
              draggable
              onDragStart={(e) => {
                dragId.current = p.id;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", p.id);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                dropOn(p.id);
              }}
              className="group flex flex-col border border-line bg-char"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(p.url, 520)} alt={p.alt || p.title} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 flex items-center gap-1 bg-ink/85 px-2 py-1 text-[11px] font-semibold text-bone">
                  <GripVertical size={12} aria-hidden="true" />
                  {filtered ? "•" : (meta.page - 1) * PER_PAGE + i + 1}
                </span>
                {!p.published ? <span className="absolute right-2 top-2 bg-danger px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">Draft</span> : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="truncate text-[13px] font-semibold" title={p.title}>
                  {p.title}
                </p>
                <p className="truncate text-[11px] text-mute">{p.categories.map(catName).filter(Boolean).join(", ") || "No category"}</p>
                <div className="mt-auto flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button type="button" className="a-btn px-2" onClick={() => swap(i, -1)} disabled={i === 0} aria-label={`Move ${p.title} earlier`}>
                      <ArrowLeft size={14} />
                    </button>
                    <button type="button" className="a-btn px-2" onClick={() => swap(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${p.title} later`}>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className={`a-btn px-2 ${p.featured ? "!border-sand text-gilt" : ""}`} onClick={() => quickToggle(p, "featured")} aria-pressed={p.featured} aria-label={`${p.featured ? "Remove from" : "Add to"} featured work: ${p.title}`}>
                      <Star size={14} fill={p.featured ? "currentColor" : "none"} />
                    </button>
                    <button type="button" className="a-btn px-2" onClick={() => setEditing(p)} aria-label={`Edit ${p.title}`}>
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="a-btn-danger px-2" onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta.totalPages > 1 ? (
        <nav aria-label="Admin gallery pages" className="mt-8 flex items-center justify-between">
          <p className="text-[12px] uppercase tracking-caps text-mute">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button type="button" className="a-btn" disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}>
              Previous
            </button>
            <button type="button" className="a-btn" disabled={meta.page >= meta.totalPages} onClick={() => load(meta.page + 1)}>
              Next
            </button>
          </div>
        </nav>
      ) : null}

      {uploading ? (
        <UploadModal
          categories={categories}
          onClose={() => setUploading(false)}
          onDone={(count) => {
            say(`${count} photograph${count === 1 ? "" : "s"} added at the end of the gallery.`);
            load(1);
          }}
        />
      ) : null}

      {editing ? (
        <EditModal
          photo={editing}
          categories={categories}
          projects={projects}
          position={!filtered ? (meta.page - 1) * PER_PAGE + items.findIndex((x) => x.id === editing.id) + 1 : ""}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            say(msg);
            setEditing(null);
            load(meta.page);
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmModal
          title="Delete photograph?"
          text={`“${deleting.title}” will be removed from the gallery and from Cloudinary storage. This cannot be undone.`}
          busy={busy}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </>
  );
}

/* ----------------------------- upload dialog ----------------------------- */

function UploadModal({ categories, onClose, onDone }) {
  const [files, setFiles] = useState([]);
  const [cats, setCats] = useState([]);
  const [published, setPublished] = useState(true);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState("");
  const input = useRef(null);
  const previews = useRef([]);

  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function add(list) {
    const next = [];
    for (const file of Array.from(list)) {
      const problem = checkFile(file);
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      next.push({
        key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview,
        title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120),
        progress: 0,
        status: problem ? "error" : "ready",
        message: problem || "",
      });
    }
    setFiles((f) => [...f, ...next].slice(0, 20));
  }

  const patch = (key, p) => setFiles((f) => f.map((x) => (x.key === key ? { ...x, ...p } : x)));

  async function start() {
    setRunning(true);
    setSummary("");
    const queue = files.filter((f) => f.status === "ready" || f.status === "failed");
    const uploaded = [];

    async function worker() {
      while (queue.length) {
        const f = queue.shift();
        patch(f.key, { status: "uploading", progress: 0, message: "" });
        try {
          const up = await uploadToCloudinary(f.file, "photo", (pr) => patch(f.key, { progress: pr }));
          uploaded.push({ key: f.key, publicId: up.publicId, title: f.title });
          patch(f.key, { progress: 100, status: "saving" });
        } catch (err) {
          patch(f.key, { status: "failed", message: err.message });
        }
      }
    }
    await Promise.all([worker(), worker()]);

    let saved = 0;
    if (uploaded.length) {
      try {
        const res = await api("/api/admin/photos", {
          method: "POST",
          body: { items: uploaded.map((u) => ({ publicId: u.publicId, title: u.title, categories: cats, published })) },
        });
        saved = res.items.length;
        const failedIds = new Set((res.failed || []).map((x) => x.publicId));
        uploaded.forEach((u) => patch(u.key, failedIds.has(u.publicId) ? { status: "failed", message: "Could not be saved." } : { status: "saved" }));
      } catch (err) {
        uploaded.forEach((u) => patch(u.key, { status: "failed", message: err.message }));
      }
    }
    setRunning(false);
    setSummary(saved ? `${saved} saved.` : "Nothing was saved.");
    if (saved) onDone(saved);
  }

  const readyCount = files.filter((f) => f.status === "ready" || f.status === "failed").length;

  return (
    <Modal
      wide
      title="Upload photographs"
      onClose={running ? () => {} : onClose}
      footer={
        <>
          <span className="mr-auto self-center text-[13px] text-gilt" role="status">
            {summary}
          </span>
          <button type="button" className="a-btn" onClick={onClose} disabled={running}>
            Close
          </button>
          <button type="button" className="a-btn-primary" onClick={start} disabled={running || readyCount === 0}>
            {running ? "Uploading…" : `Upload ${readyCount || ""}`}
          </button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div>
          <input ref={input} type="file" multiple accept={ACCEPT} className="sr-only" aria-label="Choose photograph files" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              add(e.dataTransfer.files);
            }}
            disabled={running}
            className="flex w-full flex-col items-center gap-2 border border-dashed border-line p-8 text-mute transition-colors hover:border-sand hover:text-bone"
          >
            <ImagePlus size={28} strokeWidth={1.3} />
            <span className="text-[13px] font-semibold">Choose images or drop them here</span>
            <span className="text-[11px]">JPG, PNG, WebP or AVIF · up to 25 MB each · max 20 at a time</span>
          </button>

          <ul className="mt-4 flex flex-col gap-3">
            {files.map((f) => (
              <li key={f.key} className="flex gap-3 border border-line p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.preview} alt="" className="h-16 w-20 flex-none object-cover" />
                <div className="min-w-0 flex-1">
                  <label className="sr-only" htmlFor={`t-${f.key}`}>
                    Title for {f.file.name}
                  </label>
                  <input id={`t-${f.key}`} value={f.title} onChange={(e) => patch(f.key, { title: e.target.value })} disabled={running || f.status === "saved"} className="a-input !py-1.5" />
                  <div className="mt-1.5 h-1 bg-line" aria-hidden="true">
                    <div className={`h-1 ${f.status === "failed" || f.status === "error" ? "bg-danger" : "bg-sand"}`} style={{ width: `${f.progress}%` }} />
                  </div>
                  <p className={`mt-1 text-[11px] ${f.status === "failed" || f.status === "error" ? "text-danger" : "text-mute"}`} role={f.message ? "alert" : undefined}>
                    {f.message || { ready: "Ready", uploading: `Uploading ${f.progress}%`, saving: "Saving…", saved: "Saved ✓" }[f.status]}
                  </p>
                </div>
                {!running && f.status !== "saved" ? (
                  <button type="button" className="a-btn h-9 min-h-0 px-2" aria-label={`Remove ${f.file.name}`} onClick={() => setFiles((l) => l.filter((x) => x.key !== f.key))}>
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <fieldset className="flex flex-col gap-3 self-start border border-line p-4">
          <legend className="px-1 text-[11px] font-semibold uppercase tracking-caps text-mute">Apply to all</legend>
          {categories.length ? (
            categories.map((c) => (
              <label key={c.id} className="flex items-center gap-3 text-[13px]">
                <input type="checkbox" checked={cats.includes(c.id)} onChange={(e) => setCats((l) => (e.target.checked ? [...l, c.id] : l.filter((x) => x !== c.id)))} className="h-4 w-4 accent-[rgb(var(--accent))]" disabled={running} />
                {c.name}
              </label>
            ))
          ) : (
            <p className="text-[12px] text-mute">Create categories first to assign them.</p>
          )}
          <label className="mt-2 flex items-center gap-3 border-t border-line pt-3 text-[13px]">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" disabled={running} />
            Publish immediately
          </label>
        </fieldset>
      </div>
    </Modal>
  );
}

/* ------------------------------- edit dialog ------------------------------ */

function EditModal({ photo, categories, projects, position, onClose, onSaved }) {
  const [v, setV] = useState({
    title: photo.title,
    caption: photo.caption || "",
    alt: photo.alt || "",
    description: photo.description || "",
    categories: photo.categories || [],
    project: photo.project || "",
    location: photo.location || "",
    takenAt: photo.takenAt || "",
    featured: Boolean(photo.featured),
    published: Boolean(photo.published),
  });
  const [pos, setPos] = useState(position ? String(position) : "");
  const [replacement, setReplacement] = useState(null); // { publicId, preview }
  const [replaceProgress, setReplaceProgress] = useState(null);
  const [heroBusy, setHeroBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const file = useRef(null);
  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  async function chooseReplacement(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setMessage("");
    setReplaceProgress(0);
    try {
      const up = await uploadToCloudinary(f, "photo", setReplaceProgress);
      setReplacement({ publicId: up.publicId, preview: URL.createObjectURL(f) });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setReplaceProgress(null);
    }
  }

  async function useAsHero() {
    setHeroBusy(true);
    setMessage("");
    try {
      await api(`/api/admin/photos/${photo.id}`, { method: "PATCH", body: { useAsHero: true } });
      setMessage("This photograph is now the landing-page hero image.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setHeroBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage("");
    try {
      const body = { ...v };
      if (replacement) body.replaceWith = replacement.publicId;
      if (pos && Number(pos) !== position) body.position = Number(pos);
      await api(`/api/admin/photos/${photo.id}`, { method: "PATCH", body });
      onSaved("Photograph saved.");
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      wide
      title="Edit photograph"
      onClose={onClose}
      footer={
        <>
          <span className="mr-auto self-center text-[13px] text-danger" role="alert">
            {message}
          </span>
          <button type="button" className="a-btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="photo-form" className="a-btn-primary" disabled={busy || replaceProgress !== null}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </>
      }
    >
      <form id="photo-form" onSubmit={save} className="grid gap-6 md:grid-cols-[260px_1fr]" noValidate>
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={replacement?.preview || thumb(photo.url, 700)} alt={photo.alt || photo.title} className="w-full border border-line object-cover" />
          <input ref={file} type="file" accept={ACCEPT} className="sr-only" aria-label="Choose replacement image" onChange={chooseReplacement} />
          <button type="button" className="a-btn" onClick={() => file.current?.click()} disabled={replaceProgress !== null}>
            <ImagePlus size={16} /> {replaceProgress !== null ? `Uploading ${replaceProgress}%` : replacement ? "Choose another file" : "Replace image file"}
          </button>
          {replacement ? <p className="text-[12px] text-gilt">New image ready — it replaces the old file when you save.</p> : null}
          <button type="button" className="a-btn" onClick={useAsHero} disabled={heroBusy}>
            {heroBusy ? "Setting…" : "Use as hero image"}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Title" htmlFor="pe-title" error={errors.title}>
            <input id="pe-title" value={v.title} onChange={(e) => set("title", e.target.value)} className="a-input" />
          </Field>
          <Field label="Caption" htmlFor="pe-caption" error={errors.caption}>
            <input id="pe-caption" value={v.caption} onChange={(e) => set("caption", e.target.value)} className="a-input" />
          </Field>
          <Field label="Alt text (accessibility)" htmlFor="pe-alt" error={errors.alt} hint="Describe what is in the photograph for screen-reader users.">
            <input id="pe-alt" value={v.alt} onChange={(e) => set("alt", e.target.value)} className="a-input" />
          </Field>
          <Field label="Description" htmlFor="pe-desc" error={errors.description}>
            <textarea id="pe-desc" rows={3} value={v.description} onChange={(e) => set("description", e.target.value)} className="a-input resize-y" />
          </Field>
          <fieldset>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-caps text-mute">Categories</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={v.categories.includes(c.id)} onChange={(e) => set("categories", e.target.checked ? [...v.categories, c.id] : v.categories.filter((x) => x !== c.id))} className="h-4 w-4 accent-[rgb(var(--accent))]" />
                  {c.name}
                </label>
              ))}
              {!categories.length ? <span className="text-[12px] text-mute">No categories yet.</span> : null}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project" htmlFor="pe-project">
              <select id="pe-project" value={v.project} onChange={(e) => set("project", e.target.value)} className="a-input">
                <option value="">— None —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Gallery position" htmlFor="pe-pos" hint={position ? "1 = first on the website." : "Clear filters to see and change the position."}>
              <input id="pe-pos" type="number" min={1} value={pos} onChange={(e) => setPos(e.target.value)} disabled={!position} className="a-input" />
            </Field>
            <Field label="Location" htmlFor="pe-loc">
              <input id="pe-loc" value={v.location} onChange={(e) => set("location", e.target.value)} className="a-input" />
            </Field>
            <Field label="Date / year" htmlFor="pe-date">
              <input id="pe-date" value={v.takenAt} onChange={(e) => set("takenAt", e.target.value)} placeholder="2026" className="a-input" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-3 text-[14px]">
              <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
              Published
            </label>
            <label className="flex items-center gap-3 text-[14px]">
              <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
              Featured on home page
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
