import { reorderHandler } from "@/lib/admin/crud";
import { CATEGORY } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { POST } = reorderHandler({ model: CATEGORY.model });
