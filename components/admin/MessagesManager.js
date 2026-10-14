"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { api } from "@/components/admin/api";
import { ConfirmModal, Notice, PageHeader } from "@/components/admin/ui";

export default function MessagesManager() {
  const [items, setItems] = useState(null);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, unread: 0 });
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [open, setOpen] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const load = useCallback(
    async (page = 1) => {
      try {
        const res = await api(`/api/admin/messages?page=${page}${unreadOnly ? "&filter=unread" : ""}`);
        setItems(res.items);
        setMeta({ page: res.page, totalPages: res.totalPages, unread: res.unread });
        setError("");
      } catch (err) {
        setError(err.message);
      }
    },
    [unreadOnly]
  );
  useEffect(() => {
    load(1);
  }, [load]);

  async function setRead(m, read) {
    try {
      await api(`/api/admin/messages/${m.id}`, { method: "PATCH", body: { read } });
      setItems((l) => l.map((x) => (x.id === m.id ? { ...x, read } : x)));
      setMeta((s) => ({ ...s, unread: Math.max(0, s.unread + (read ? -1 : 1) * (m.read === read ? 0 : 1)) }));
    } catch (err) {
      setNotice({ kind: "error", text: err.message });
    }
  }

  function toggleOpen(m) {
    const next = open === m.id ? "" : m.id;
    setOpen(next);
    if (next && !m.read) setRead(m, true);
  }

  async function remove() {
    try {
      await api(`/api/admin/messages/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      load(meta.page);
    } catch (err) {
      setNotice({ kind: "error", text: err.message });
      setDeleting(null);
    }
  }

  return (
    <>
      <PageHeader title="Contact Messages" subtitle={`${meta.unread} unread. Messages are private and only visible here.`}>
        <label className="flex items-center gap-3 text-[13px]">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
          Unread only
        </label>
      </PageHeader>
      <Notice notice={notice} />
      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : items === null ? (
        <p className="text-mute">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center text-mute">No messages.</div>
      ) : (
        <ul className="divide-y divide-line border border-line bg-char">
          {items.map((m) => (
            <li key={m.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => toggleOpen(m)} aria-expanded={open === m.id} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  {m.read ? <MailOpen size={18} className="flex-none text-mute" /> : <Mail size={18} className="flex-none text-gilt" />}
                  <span className="min-w-0">
                    <span className={`block truncate text-[15px] ${m.read ? "" : "font-bold"}`}>{m.subject}</span>
                    <span className="block truncate text-[12px] text-mute">
                      {m.name} · {m.email} · {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </span>
                </button>
                <button type="button" className="a-btn" onClick={() => setRead(m, !m.read)}>
                  Mark {m.read ? "unread" : "read"}
                </button>
                <button type="button" className="a-btn-danger px-3" onClick={() => setDeleting(m)} aria-label={`Delete message from ${m.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
              {open === m.id ? (
                <div className="mt-4 border-t border-line pt-4">
                  {m.service ? <p className="mb-2 text-[12px] uppercase tracking-caps text-mute">Service: {m.service}</p> : null}
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.message}</p>
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="a-btn mt-4">
                    Reply by email
                  </a>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {meta.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
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
        </div>
      ) : null}
      {deleting ? <ConfirmModal title="Delete message?" text={`The message from ${deleting.name} will be deleted permanently.`} onConfirm={remove} onCancel={() => setDeleting(null)} /> : null}
    </>
  );
}
