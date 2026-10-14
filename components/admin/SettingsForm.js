"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { api, thumb } from "@/components/admin/api";
import { Field, Notice, PageHeader } from "@/components/admin/ui";
import ImageField from "@/components/admin/ImageField";

function Section({ title, hint, children }) {
  return (
    <section className="border border-line bg-char p-6">
      <h2 className="font-serif text-[28px] leading-none">{title}</h2>
      {hint ? <p className="mb-5 mt-2 text-[13px] text-mute">{hint}</p> : <div className="mb-5" />}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export default function SettingsForm() {
  const [s, setS] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api("/api/admin/settings")
      .then((r) => setS(r.settings))
      .catch((e) => setLoadError(e.message));
  }, []);

  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const text = (k, label, props = {}) => (
    <Field label={label} htmlFor={`s-${k}`} error={errors[k]} hint={props.hint}>
      {props.area ? (
        <textarea id={`s-${k}`} rows={props.rows || 3} value={s[k] || ""} onChange={(e) => set(k, e.target.value)} className="a-input resize-y" />
      ) : (
        <input id={`s-${k}`} type={props.type || "text"} value={s[k] || ""} onChange={(e) => set(k, e.target.value)} className="a-input" />
      )}
    </Field>
  );

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const { brandName, ownerName, heroEyebrow, heroHeadline, heroDescription, heroImage, heroPosition, aboutStatement, aboutParagraphs, aboutImage, stats, email, phone, location, availability, socials, footerText, defaultTheme, galleryPageSize } = s;
      const res = await api("/api/admin/settings", {
        method: "PUT",
        body: {
          brandName, ownerName, heroEyebrow, heroHeadline, heroDescription,
          heroImage: heroImage || null,
          heroPosition,
          aboutStatement,
          aboutParagraphs: (aboutParagraphs || []).filter((p) => p.trim()),
          aboutImage: aboutImage || null,
          stats: (stats || []).filter((x) => x.value || x.label),
          email, phone, location, availability,
          socials: (socials || []).filter((x) => x.label || x.url),
          footerText, defaultTheme,
          galleryPageSize: Number(galleryPageSize),
        },
      });
      setS(res.settings);
      setNotice({ kind: "ok", text: "Settings saved. The website is updated." });
    } catch (err) {
      setErrors(err.errors || {});
      setNotice({ kind: "error", text: err.message });
    } finally {
      setBusy(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (loadError)
    return (
      <p role="alert" className="text-danger">
        {loadError}
      </p>
    );
  if (!s) return <p className="text-mute">Loading…</p>;

  const pos = s.heroPosition || { x: 50, y: 50 };
  const listUpdate = (key, i, patch) => set(key, s[key].map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <form onSubmit={save} noValidate className="flex max-w-4xl flex-col gap-8">
      <PageHeader title="Settings" subtitle="Everything editable on the public website lives here.">
        <button type="submit" className="a-btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save all settings"}
        </button>
      </PageHeader>
      <Notice notice={notice} />

      <Section title="Brand" hint="Shown in the navigation, footer and browser tab.">
        {text("brandName", "Brand name")}
        {text("ownerName", "Photographer name (optional)")}
      </Section>

      <Section title="Landing page hero" hint="The first thing visitors see. Upload the photograph that represents your work best.">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageField value={s.heroImage} onChange={(img) => set("heroImage", img)} label="hero image" kind="site" aspect="aspect-[4/3]" />
          <div className="flex flex-col gap-4">
            <Field label={`Focal point — horizontal ${pos.x}%`} htmlFor="hx" hint="Which part of the photograph stays visible on small screens.">
              <input id="hx" type="range" min={0} max={100} value={pos.x} onChange={(e) => set("heroPosition", { ...pos, x: Number(e.target.value) })} className="accent-[rgb(var(--accent))]" />
            </Field>
            <Field label={`Focal point — vertical ${pos.y}%`} htmlFor="hy">
              <input id="hy" type="range" min={0} max={100} value={pos.y} onChange={(e) => set("heroPosition", { ...pos, y: Number(e.target.value) })} className="accent-[rgb(var(--accent))]" />
            </Field>
            {s.heroImage?.url ? (
              <div className="relative h-24 w-full overflow-hidden border border-line" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(s.heroImage.url, 500)} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${pos.x}% ${pos.y}%` }} />
              </div>
            ) : null}
          </div>
        </div>
        {text("heroEyebrow", "Small label above the headline")}
        {text("heroHeadline", "Headline", { area: true, rows: 3, hint: "One line per row. The last line is shown in italic champagne." })}
        {text("heroDescription", "Short description", { area: true })}
      </Section>

      <Section title="About" hint="Leave blank to hide the About section. Only add information that is true.">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <ImageField value={s.aboutImage} onChange={(img) => set("aboutImage", img)} label="portrait" kind="site" aspect="aspect-[3/4]" />
          <div className="flex flex-col gap-5">
            {text("aboutStatement", "Statement", { area: true, hint: "A single editorial sentence shown in large type." })}
            {[0, 1].map((i) => (
              <Field key={i} label={`Biography paragraph ${i + 1}`} htmlFor={`bio-${i}`}>
                <textarea
                  id={`bio-${i}`}
                  rows={4}
                  value={s.aboutParagraphs?.[i] || ""}
                  onChange={(e) => {
                    const next = [...(s.aboutParagraphs || [])];
                    while (next.length < 2) next.push("");
                    next[i] = e.target.value;
                    set("aboutParagraphs", next);
                  }}
                  className="a-input resize-y"
                />
              </Field>
            ))}
          </div>
        </div>
        <fieldset>
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-caps text-mute">Highlights (genuine numbers only, up to 4)</legend>
          <div className="flex flex-col gap-3">
            {(s.stats || []).map((row, i) => (
              <div key={i} className="flex gap-3">
                <input aria-label={`Highlight ${i + 1} value`} placeholder="10+" value={row.value || ""} onChange={(e) => listUpdate("stats", i, { value: e.target.value })} className="a-input w-28" />
                <input aria-label={`Highlight ${i + 1} label`} placeholder="Years behind the lens" value={row.label || ""} onChange={(e) => listUpdate("stats", i, { label: e.target.value })} className="a-input flex-1" />
                <button type="button" className="a-btn px-3" aria-label="Remove highlight" onClick={() => set("stats", s.stats.filter((_, j) => j !== i))}>
                  <X size={16} />
                </button>
              </div>
            ))}
            {(s.stats || []).length < 4 ? (
              <button type="button" className="a-btn self-start" onClick={() => set("stats", [...(s.stats || []), { value: "", label: "" }])}>
                <Plus size={16} /> Add highlight
              </button>
            ) : null}
          </div>
        </fieldset>
      </Section>

      <Section title="Contact & location">
        <div className="grid gap-5 md:grid-cols-2">
          {text("email", "Contact email", { type: "email" })}
          {text("phone", "Phone (optional)")}
          {text("location", "Location", { hint: "Shown as “Based in …” on the hero." })}
          {text("availability", "Availability label", { hint: "e.g. Available worldwide" })}
        </div>
      </Section>

      <Section title="Social links" hint="Only links with both a name and a full https:// address are shown.">
        <div className="flex flex-col gap-3">
          {(s.socials || []).map((row, i) => (
            <div key={i} className="flex flex-wrap gap-3">
              <input aria-label={`Social ${i + 1} name`} placeholder="Instagram" value={row.label || ""} onChange={(e) => listUpdate("socials", i, { label: e.target.value })} className="a-input w-40" />
              <input aria-label={`Social ${i + 1} link`} placeholder="https://instagram.com/yourname" value={row.url || ""} onChange={(e) => listUpdate("socials", i, { url: e.target.value })} className="a-input min-w-[220px] flex-1" />
              <button type="button" className="a-btn px-3" aria-label="Remove link" onClick={() => set("socials", s.socials.filter((_, j) => j !== i))}>
                <X size={16} />
              </button>
            </div>
          ))}
          {errors.socials ? <p role="alert" className="text-[12px] text-danger">{errors.socials}</p> : null}
          {(s.socials || []).length < 8 ? (
            <button type="button" className="a-btn self-start" onClick={() => set("socials", [...(s.socials || []), { label: "", url: "" }])}>
              <Plus size={16} /> Add link
            </button>
          ) : null}
        </div>
      </Section>

      <Section title="Website behaviour">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Default theme for new visitors" htmlFor="s-theme" hint="A visitor's own choice (sun/moon button) always wins.">
            <select id="s-theme" value={s.defaultTheme} onChange={(e) => set("defaultTheme", e.target.value)} className="a-input">
              <option value="system">Follow the visitor's device</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Field>
          <Field label="Photographs per gallery page" htmlFor="s-page" error={errors.galleryPageSize}>
            <input id="s-page" type="number" min={3} max={60} value={s.galleryPageSize} onChange={(e) => set("galleryPageSize", e.target.value)} className="a-input" />
          </Field>
        </div>
        {text("footerText", "Footer text", { area: true, rows: 2 })}
      </Section>

      <div>
        <button type="submit" className="a-btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save all settings"}
        </button>
      </div>
    </form>
  );
}
