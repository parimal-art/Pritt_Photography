/**
 * Best-effort in-memory sliding-window limiter (per server instance).
 * Login also has a durable per-account lockout stored in MongoDB, so this layer
 * only needs to blunt bursts from a single IP.
 */
const buckets = new Map();

/** @returns {boolean} true when the caller is OVER the limit */
export function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return recent.length > limit;
}

export function clientIp(request) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
}
