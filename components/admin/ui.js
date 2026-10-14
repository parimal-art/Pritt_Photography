"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ title, onClose, children, wide = false, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement;
    ref.current?.querySelector("input, textarea, select, button")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 p-4 md:p-10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`w-full ${wide ? "max-w-4xl" : "max-w-xl"} border border-line bg-char text-bone`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-[26px] leading-none">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center hover:text-gilt">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-3 border-t border-line px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[11px] font-semibold uppercase tracking-caps text-mute">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-[12px] text-mute">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-[12px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ConfirmModal({ title, text, confirmLabel = "Delete", busy, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="a-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="a-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[14px] leading-relaxed text-ash">{text}</p>
    </Modal>
  );
}

export function Notice({ notice }) {
  return (
    <div aria-live="polite" className="min-h-[28px]">
      {notice ? (
        <p role={notice.kind === "error" ? "alert" : "status"} className={`text-[13px] ${notice.kind === "error" ? "text-danger" : "text-gilt"}`}>
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}

export function PageHeader({ title, children, subtitle }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[clamp(36px,4vw,56px)] leading-none">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-xl text-[14px] text-mute">{subtitle}</p> : null}
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </header>
  );
}
