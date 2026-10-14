import { itemHandlers } from "@/lib/admin/crud";
import { SERVICE } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { PATCH, DELETE } = itemHandlers(SERVICE);
