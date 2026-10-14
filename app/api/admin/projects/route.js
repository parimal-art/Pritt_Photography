import { collectionHandlers } from "@/lib/admin/crud";
import { PROJECT } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { GET, POST } = collectionHandlers(PROJECT);
