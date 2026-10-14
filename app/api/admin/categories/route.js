import { collectionHandlers } from "@/lib/admin/crud";
import { CATEGORY } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { GET, POST } = collectionHandlers(CATEGORY);
