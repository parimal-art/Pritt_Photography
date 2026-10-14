import { reorderHandler } from "@/lib/admin/crud";
import { TESTIMONIAL } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { POST } = reorderHandler({ model: TESTIMONIAL.model });
