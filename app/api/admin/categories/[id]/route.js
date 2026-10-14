import { itemHandlers } from "@/lib/admin/crud";
import { CATEGORY } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { PATCH, DELETE } = itemHandlers(CATEGORY);
