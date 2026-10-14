import { NextResponse } from "next/server";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { Message } from "@/lib/db/models";
import { validate } from "@/lib/validation";
import { rateLimited, clientIp } from "@/lib/auth/rate-limit";
import { getSettings } from "@/lib/db/queries";

export const runtime = "nodejs";

const RULES = {
  name: { type: "string", required: true, max: 120, label: "Name" },
  email: { type: "email", required: true, label: "Email" },
  subject: { type: "string", required: true, max: 160, label: "Subject" },
  service: { type: "string", max: 80, label: "Service" },
  message: { type: "text", required: true, min: 10, max: 5000, label: "Message" },
};

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * The message is saved in MongoDB (visible in Admin → Contact Messages). Success is only
 * reported after the save worked. If Resend is configured an e-mail alert is sent too.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
  if (body?.website) return NextResponse.json({ ok: true }); // honeypot

  const { data, errors, ok } = validate(body, RULES);
  if (!ok) return NextResponse.json({ ok: false, errors, message: "Please check the highlighted fields." }, { status: 422 });

  if (rateLimited(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, message: "Too many messages. Please try again later." }, { status: 429 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, message: "The contact form is not connected yet, so your message was not sent." }, { status: 503 });
  }

  try {
    await connectDB();
    await Message.create(data);
  } catch (err) {
    console.error("[contact] save failed:", err?.message || err);
    return NextResponse.json({ ok: false, message: "We could not send your message. Please try again." }, { status: 502 });
  }

  // Optional e-mail alert (never blocks or fails the submission).
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (RESEND_API_KEY && CONTACT_TO_EMAIL && CONTACT_FROM_EMAIL) {
    try {
      const s = await getSettings();
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: CONTACT_FROM_EMAIL,
          to: [CONTACT_TO_EMAIL],
          reply_to: data.email,
          subject: `[${s.brandName}] ${data.subject}`,
          html: `<p><strong>${esc(data.name)}</strong> &lt;${esc(data.email)}&gt; — ${esc(data.service || "no service chosen")}</p><p>${esc(data.message).replace(/\n/g, "<br>")}</p>`,
        }),
      });
    } catch (err) {
      console.error("[contact] email alert failed:", err?.message || err);
    }
  }
  return NextResponse.json({ ok: true });
}
