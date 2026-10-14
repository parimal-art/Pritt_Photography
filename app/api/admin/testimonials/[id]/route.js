import { itemHandlers } from "@/lib/admin/crud";
import { TESTIMONIAL } from "@/lib/admin/resources";

export const runtime = "nodejs";
export const { PATCH, DELETE } = itemHandlers(TESTIMONIAL);
