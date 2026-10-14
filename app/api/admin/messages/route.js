import { connectDB } from "@/lib/db/connect";
import { Message } from "@/lib/db/models";
import { plainList } from "@/lib/db/serialize";
import { handle, json, requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";

/** GET ?filter=unread&page= — contact messages are only ever readable by the admin. */
export const GET = handle(async (request) => {
  await requireAdmin(request);
  await connectDB();
  const sp = request.nextUrl.searchParams;
  const filter = sp.get("filter") === "unread" ? { read: false } : {};
  const perPage = 20;
  const total = await Message.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(parseInt(sp.get("page"), 10) || 1, 1), totalPages);
  const items = await Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean();
  const unread = await Message.countDocuments({ read: false });
  return json({ ok: true, items: plainList(items), total, page, totalPages, unread });
});
