import { reorderHandler } from "@/lib/admin/crud";
import { SERVICE } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { POST } = reorderHandler({ model: SERVICE.model });
