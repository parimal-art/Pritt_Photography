import { Photo } from "@/lib/db/models";
import { reorderHandler } from "@/lib/admin/crud";

export const runtime = "nodejs";
export const { POST } = reorderHandler({ model: Photo, field: "order" });
