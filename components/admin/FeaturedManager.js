"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Search, X } from "lucide-react";
import { api, thumb } from "@/components/admin/api";
import { Modal, Notice, PageHeader } from "@/components/admin/ui";

export default function FeaturedManager() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [adding, setAdding] = useState(false);

  const say = (text, kind = "ok") => {
    setNotice({ text, kind });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const load = useCallback(async () => {
    try {
      setItems((await api("/api/admin/photos?featured=1&perPage=60")).items);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    try {
      await api("/api/admin/featured/reorder", { method: "POST", body: { ids: next.map((p) => p.id) } });
    } catch (err) {
      say(err.message, "error");
      load();
    }
  }

  async function remove(photo) {
    try {
      await api(`/api/admin/photos/${photo.id}`, { method: "PATCH", body: { featured: false } });
      setItems((l) => l.filter((p) => p.id !== photo.id));
      say("Removed from featured work.");
    } catch (err) {
      say(err.message, "error");
    }
  }

  return (
    <>
      <PageHeader title="Featured Work" subtitle="These photographs appear in the “Selected work” section of the home page, in this order (top = first).">
        <button type="button" className="a-btn-primary" onClick={() => setAdding(true)}>
          <Plus size={16} strokeWidth={1.8} /> Add photographs
        </button>
      </PageHeader>
      <Notice notice={notice} />
      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : items === null ? (
        <p className="text-mute">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center text-mute">No featured photographs yet. Without any, the Featured Work section stays hidden.</div>
      ) : (
        <ol className="divide-y divide-line border border-line bg-char">
          {items.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-3">
              <span className="w-8 text-center font-serif text-[24px] text-mute">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(p.url, 200)} alt="" className="h-16 w-24 flex-none object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[22px] leading-tight">{p.title}</p>
                {!p.published ? <p className="text-[12px] text-danger">Draft — not visible until published</p> : null}
              </div>
              <div className="flex gap-1">
                <button type="button" className="a-btn px-3" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${p.title} up`}>
                  <ArrowUp size={16} />
                </button>
                <button type="button" className="a-btn px-3" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${p.title} down`}>
                  <ArrowDown size={16} />
                </button>
                <button type="button" className="a-btn-danger px-3" onClick={() => remove(p)} aria-label={`Remove ${p.title} from featured`}>
                  <X size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {adding ? <Picker onClose={() => { setAdding(false); load(); }} onAdded={() => say("Added to featured work.")} /> : null}
    </>
  );
}

function Picker({ onClose, onAdded }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ status: "published", perPage: "48" });
        if (q) params.set("q", q);
        setItems((await api(`/api/admin/photos?${params}`)).items);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [q]);

  async function add(p) {
    setBusyId(p.id);
    try {
      await api(`/api/admin/photos/${p.id}`, { method: "PATCH", body: { featured: true } });
      setItems((l) => l.map((x) => (x.id === p.id ? { ...x, featured: true } : x)));
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <Modal wide title="Add featured photographs" onClose={onClose}>
      <div className="relative mb-4">
        <label htmlFor="fp-q" className="sr-only">
          Search published photographs
        </label>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input id="fp-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search published photographs" className="a-input pl-9" />
      </div>
      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : null}
      {items === null ? (
        <p className="text-mute">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-mute">No published photographs found.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((p) => (
            <li key={p.id} className="border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(p.url, 320)} alt={p.alt || p.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="p-2">
                <p className="truncate text-[12px] font-semibold">{p.title}</p>
                <button type="button" className="a-btn mt-2 w-full" disabled={p.featured || busyId === p.id} onClick={() => add(p)}>
                  {p.featured ? "Featured ✓" : busyId === p.id ? "Adding…" : "Add"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
