"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import SplitText from "@/components/animations/SplitText";
import Magnetic from "@/components/animations/Magnetic";

const EMPTY = { name: "", email: "", subject: "", service: "", message: "", website: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Please enter your name.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (!v.subject.trim()) e.subject = "Please add a subject.";
  if (v.message.trim().length < 10) e.message = "Please write a few words about your project.";
  return e;
}

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] uppercase tracking-caps text-mute">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-gilt">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full border-0 border-b border-line bg-transparent py-3 text-[18px] text-bone placeholder:text-mute/70 transition-colors focus:border-sand focus:outline-none aria-[invalid=true]:border-sand";

export default function Contact({ settings, services = [] }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("idle");
      setMessage("");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("success");
        setValues(EMPTY);
      } else {
        if (data.errors) setErrors(data.errors);
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  const socials = (settings.socials || []).filter((s) => s.url);

  return (
    <section id="contact" className="scroll-mt-20 border-t border-line bg-char px-6 py-28 md:px-14 md:py-44">
      <div className="mx-auto flex max-w-[1800px] flex-wrap gap-x-20 gap-y-16">
        <div className="min-w-0 flex-1 basis-[440px]">
          <p className="eyebrow">06 — Contact</p>
          <h2 className="mt-8 font-serif text-[clamp(52px,8vw,128px)] font-normal leading-[0.92] tracking-[-0.02em]">
            <SplitText text={"Let's create\nsomething\n*timeless.*"} trigger="scroll" />
          </h2>

          <div className="mt-12 flex flex-col gap-2 text-[17px]">
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="link-underline w-fit">
                {settings.email}
              </a>
            ) : null}
            {settings.phone ? <span className="text-ash">{settings.phone}</span> : null}
            {settings.location ? <span className="text-mute">{settings.location}</span> : null}
          </div>
          {socials.length ? (
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-1 text-[12px] uppercase tracking-caps">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline inline-block py-2">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <form onSubmit={onSubmit} noValidate className="flex min-w-0 max-w-[640px] flex-1 basis-[440px] flex-col gap-8">
          <Field id="c-name" label="Name" error={errors.name}>
            <input
              id="c-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={values.name}
              onChange={set("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "c-name-error" : undefined}
              className={inputClass}
            />
          </Field>
          <Field id="c-email" label="Email" error={errors.email}>
            <input
              id="c-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={set("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "c-email-error" : undefined}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-8 sm:grid-cols-2">
            <Field id="c-subject" label="Subject" error={errors.subject}>
              <input
                id="c-subject"
                name="subject"
                type="text"
                placeholder="What is this about?"
                value={values.subject}
                onChange={set("subject")}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "c-subject-error" : undefined}
                className={inputClass}
              />
            </Field>
            <Field id="c-service" label="Service">
              <select id="c-service" name="service" value={values.service} onChange={set("service")} className={`${inputClass} appearance-none`}>
                <option value="" className="bg-char">
                  Select a service
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.title} className="bg-char">
                    {s.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="c-message" label="Message" error={errors.message}>
            <textarea
              id="c-message"
              name="message"
              rows={4}
              placeholder="Tell me about the project, dates and place"
              value={values.message}
              onChange={set("message")}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "c-message-error" : undefined}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* Honeypot — hidden from people, bots fill it in. */}
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="c-website">Website</label>
            <input id="c-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Magnetic>
              <button type="submit" disabled={status === "submitting"} className="btn-solid">
                {status === "submitting" ? "Sending…" : "Send message"}
                <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </Magnetic>
            <div aria-live="polite" className="min-h-[24px] text-[14px]">
              {status === "success" ? <span className="text-gilt">Thank you — your message has been sent.</span> : null}
              {status === "error" ? <span role="alert" className="text-gilt">{message}</span> : null}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
