"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { api, thumb } from "@/components/admin/api";
import { ConfirmModal, Field, Modal, Notice, PageHeader } from "@/components/admin/ui";
import ImageField from "@/components/admin/ImageField";

/**
 * One reusable CRUD screen (list + create/edit dialog + delete confirmation + reorder +
 * publish toggle) driven by a config. Used for Categories, Projects, Services, Testimonials.
 *
 * props:
 *  endpoint   "/api/admin/categories"
 *  singular / plural   labels
 *  fields     [{ name, label, type: text|textarea|checkbox|select|image, options?, hint?, rows? }]
 *  initial    default values for a new item
 *  titleOf(item) / metaOf(item) / imageOf(item)
 *  toggle     { key: "published", on: "Published", off: "Draft" }   (optional)
 *  subtitle   page description
 */
export default function ResourceManager({ endpoint, singular, plural, fields, initial, titleOf, metaOf, imageOf, toggle, subtitle }) {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(null); // { id|null, values }
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems((await api(endpoint)).items);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    }
  }, [endpoint]);
  useEffect(() => {
    load();
  }, [load]);

  const say = (text, kind = "ok") => {
    setNotice({ text, kind });
    window.setTimeout(() => setNotice(null), 4000);
  };

  function openNew() {
    setErrors({});
    setEditing({ id: null, values: { ...initial } });
  }
  function openEdit(item) {
    const values = {};
    fields.forEach((f) => {
      const v = item[f.name];
      values[f.name] = f.type === "checkbox" ? Boolean(v) : f.type === "image" ? v || null : v ?? "";
    });
    setErrors({});
    setEditing({ id: item.id, values });
  }

  async function save(e) {
    e?.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const body = { ...editing.values };
      const res = editing.id ? await api(`${endpoint}/${editing.id}`, { method: "PATCH", body }) : await api(endpoint, { method: "POST", body });
      setItems((list) => (editing.id ? list.map((i) => (i.id === res.item.id ? res.item : i)) : [...list, res.item]));
      setEditing(null);
      say(editing.id ? `${singular} saved.` : `${singular} created.`);
    } catch (err) {
      setErrors(err.errors || {});
      say(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`${endpoint}/${deleting.id}`, { method: "DELETE" });
      setItems((list) => list.filter((i) => i.id !== deleting.id));
      say(`${singular} deleted.`);
      setDeleting(null);
    } catch (err) {
      say(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function flip(item) {
    try {
      const res = await api(`${endpoint}/${item.id}`, { method: "PATCH", body: { [toggle.key]: !item[toggle.key] } });
      setItems((list) => list.map((i) => (i.id === item.id ? res.item : i)));
    } catch (err) {
      say(err.message, "error");
    }
  }

  async function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      await api(`${endpoint}/reorder`, { method: "POST", body: { ids: next.map((i) => i.id) } });
    } catch (err) {
      say(err.message, "error");
      load();
    }
  }

  const set = (name, value) => setEditing((s) => ({ ...s, values: { ...s.values, [name]: value } }));

  return (
    <>
      <PageHeader title={plural} subtitle={subtitle}>
        <button type="button" className="a-btn-primary" onClick={openNew}>
          <Plus size={16} strokeWidth={1.8} /> New {singular.toLowerCase()}
        </button>
      </PageHeader>
      <Notice notice={notice} />

      {loadError ? (
        <p role="alert" className="text-danger">
          {loadError}
        </p>
      ) : items === null ? (
        <p className="text-mute">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-line p-12 text-center text-mute">No {plural.toLowerCase()} yet.</div>
      ) : (
        <ul className="divide-y divide-line border border-line bg-char">
          {items.map((item, i) => (
            <li key={item.id} className="flex flex-wrap items-center gap-4 p-4">
              {imageOf?.(item) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb(imageOf(item), 160)} alt="" className="h-14 w-20 flex-none object-cover" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[22px] leading-tight">{titleOf(item)}</p>
                {metaOf ? <p className="truncate text-[12px] text-mute">{metaOf(item)}</p> : null}
              </div>
              {toggle ? (
                <button type="button" className="a-btn" onClick={() => flip(item)} aria-label={`${item[toggle.key] ? "Unpublish" : "Publish"} ${titleOf(item)}`}>
                  {item[toggle.key] ? <Eye size={16} strokeWidth={1.5} /> : <EyeOff size={16} strokeWidth={1.5} />}
                  {item[toggle.key] ? toggle.on : toggle.off}
                </button>
              ) : null}
              <div className="flex gap-1">
                <button type="button" className="a-btn px-3" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <ArrowUp size={16} strokeWidth={1.5} />
                </button>
                <button type="button" className="a-btn px-3" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                  <ArrowDown size={16} strokeWidth={1.5} />
                </button>
                <button type="button" className="a-btn px-3" onClick={() => openEdit(item)} aria-label={`Edit ${titleOf(item)}`}>
                  <Pencil size={16} strokeWidth={1.5} />
                </button>
                <button type="button" className="a-btn-danger px-3" onClick={() => setDeleting(item)} aria-label={`Delete ${titleOf(item)}`}>
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <Modal
          title={editing.id ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button type="button" className="a-btn" onClick={() => setEditing(null)} disabled={busy}>
                Cancel
              </button>
              <button type="submit" form="resource-form" className="a-btn-primary" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
            </>
          }
        >
          <form id="resource-form" onSubmit={save} className="flex flex-col gap-5" noValidate>
            {fields.map((f) => {
              const id = `rf-${f.name}`;
              const v = editing.values[f.name];
              if (f.type === "checkbox") {
                return (
                  <label key={f.name} className="flex items-center gap-3 text-[14px]">
                    <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.name, e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
                    {f.label}
                  </label>
                );
              }
              return (
                <Field key={f.name} label={f.label} htmlFor={id} error={errors[f.name]} hint={f.hint}>
                  {f.type === "textarea" ? (
                    <textarea id={id} rows={f.rows || 4} value={v} onChange={(e) => set(f.name, e.target.value)} className="a-input resize-y" />
                  ) : f.type === "select" ? (
                    <select id={id} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className="a-input">
                      {(f.options || []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "image" ? (
                    <ImageField value={v} onChange={(img) => set(f.name, img)} label={f.label.toLowerCase()} kind="site" />
                  ) : (
                    <input id={id} type="text" value={v} onChange={(e) => set(f.name, e.target.value)} className="a-input" />
                  )}
                </Field>
              );
            })}
          </form>
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmModal title={`Delete ${singular.toLowerCase()}?`} text={`“${titleOf(deleting)}” will be removed permanently. This cannot be undone.`} busy={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />
      ) : null}
    </>
  );
}
