/** Turns a lean Mongoose document into a plain JSON-safe object (`id`, ISO dates, string ids). */
export function plain(doc) {
  if (!doc) return null;
  const { _id, __v, ...rest } = JSON.parse(JSON.stringify(doc));
  return { id: _id, ...rest };
}

export const plainList = (docs) => docs.map(plain);
