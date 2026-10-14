import { connectDB } from "@/lib/db/connect";
import { Setting } from "@/lib/db/models";
import { plain } from "@/lib/db/serialize";
import { handle, json, readJson, requireAdmin } from "@/lib/auth/session";
import { validateOrThrow } from "@/lib/validation";
import { deleteAssetIfUnused } from "@/lib/admin/assets";
import { revalidateContent } from "@/lib/admin/revalidate";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

export const runtime = "nodejs";

const RULES = {
  brandName: { type: "string", required: true, max: 80, label: "Brand name" },
  ownerName: { type: "string", max: 80, label: "Photographer name" },
  heroEyebrow: { type: "string", max: 80, label: "Hero label" },
  heroHeadline: { type: "text", max: 120, label: "Hero headline" },
  heroDescription: { type: "text", max: 400, label: "Hero description" },
  heroImage: { type: "image", label: "Hero image" },
  heroPosition: { type: "point", label: "Hero focal point" },
  aboutStatement: { type: "text", max: 300, label: "About statement" },
  aboutParagraphs: { type: "list", max: 4, of: { type: "text", max: 1500 }, label: "Biography" },
  aboutImage: { type: "image", label: "About image" },
  stats: { type: "list", max: 4, item: { value: { type: "string", max: 20 }, label: { type: "string", max: 60 } }, label: "Highlights" },
  email: { type: "email", label: "Email" },
  phone: { type: "string", max: 40, label: "Phone" },
  location: { type: "string", max: 120, label: "Location" },
  availability: { type: "string", max: 120, label: "Availability" },
  socials: { type: "list", max: 8, item: { label: { type: "string", max: 60 }, url: { type: "url" } }, label: "Social links" },
  footerText: { type: "text", max: 300, label: "Footer text" },
  defaultTheme: { type: "enum", values: ["system", "dark", "light"], label: "Default theme" },
  galleryPageSize: { type: "int", min: 3, max: 60, label: "Gallery page size" },
};

export const GET = handle(async (request) => {
  await requireAdmin(request);
  await connectDB();
  const doc = await Setting.findOne({ key: "site" }).lean();
  return json({ ok: true, settings: { ...DEFAULT_SETTINGS, ...(plain(doc) || {}) } });
});

export const PUT = handle(async (request) => {
  await requireAdmin(request);
  const data = validateOrThrow(await readJson(request), RULES, { partial: true });
  await connectDB();
  const before = await Setting.findOne({ key: "site" }).lean();
  const doc = await Setting.findOneAndUpdate({ key: "site" }, { $set: data }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();

  for (const field of ["heroImage", "aboutImage"]) {
    const old = before?.[field]?.publicId;
    if (old && old !== doc[field]?.publicId) await deleteAssetIfUnused(old);
  }
  revalidateContent();
  return json({ ok: true, settings: { ...DEFAULT_SETTINGS, ...plain(doc) } });
});
