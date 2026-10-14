import { itemHandlers } from "@/lib/admin/crud";
import { PROJECT } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { PATCH, DELETE } = itemHandlers(PROJECT);
