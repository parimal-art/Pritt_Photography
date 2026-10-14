import { reorderHandler } from "@/lib/admin/crud";
import { PROJECT } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { POST } = reorderHandler({ model: PROJECT.model });
