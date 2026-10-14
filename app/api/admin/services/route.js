import { collectionHandlers } from "@/lib/admin/crud";
import { SERVICE } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { GET, POST } = collectionHandlers(SERVICE);
