import { NextResponse } from "next/server";
import { getPhotosPage, getCategories } from "@/lib/db/queries";

/** GET /api/photos?category=weddings&q=&page=2&limit=12 — public feed of PUBLISHED photographs only. */
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const [data, cats] = await Promise.all([
    getPhotosPage({ category: sp.get("category") || "all", q: sp.get("q") || "", page: sp.get("page") || 1, perPage: sp.get("limit") || 12 }),
    getCategories(),
  ]);
  if (data.error) return NextResponse.json({ ok: false, message: "Temporarily unavailable." }, { status: 502 });
  return NextResponse.json(
    { ok: true, ...data, categories: cats.categories },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
