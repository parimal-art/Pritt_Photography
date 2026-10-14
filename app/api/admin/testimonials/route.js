import { collectionHandlers } from "@/lib/admin/crud";
import { TESTIMONIAL } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { GET, POST } = collectionHandlers(TESTIMONIAL);
