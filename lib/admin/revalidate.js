import { revalidatePath, revalidateTag } from "next/cache";

export const CONTENT_TAG = "content";

/** Call after every admin write so the public site shows the change immediately. */
export function revalidateContent() {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}
