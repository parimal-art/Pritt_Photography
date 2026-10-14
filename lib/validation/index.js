/**
 * Tiny server-side validation toolkit (no extra dependency).
 *
 *   const { data, errors, ok } = validate(body, RULES, { partial: true });
 *
 * Only keys that appear in RULES can ever reach the database (mass-assignment safe).
 * `partial: true` (PATCH) skips keys that are absent instead of requiring them.
 */

const OID = /^[a-f\d]{24}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export class ValidationError extends Error {
  constructor(errors, message = "Please check the highlighted fields.") {
    super(message);
    this.errors = errors;
  }
}

export const isObjectId = (v) => typeof v === "string" && OID.test(v);

export function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clean(value, multiline) {
  let s = typeof value === "string" ? value : value == null ? "" : String(value);
  s = s.replace(/\r\n/g, "\n").replace(CONTROL, "");
  s = multiline ? s.replace(/[^\S\n]+\n/g, "\n") : s.replace(/\s+/g, " ");
  return s.trim();
}

function checkImage(value) {
  if (value == null || value === "") return { value: null };
  if (typeof value !== "object") return { error: "Invalid image." };
  const { url, publicId, width, height } = value;
  if (typeof url !== "string" || !/^https:\/\/res\.cloudinary\.com\//.test(url)) return { error: "Invalid image URL." };
  if (typeof publicId !== "string" || !publicId || publicId.length > 300) return { error: "Invalid image." };
  const w = Number(width);
  const h = Number(height);
  if (!(w > 0 && h > 0)) return { error: "Invalid image size." };
  return { value: { url, publicId, width: Math.round(w), height: Math.round(h) } };
}

function one(key, rule, value) {
  const label = rule.label || key;
  switch (rule.type) {
    case "string":
    case "text": {
      const s = clean(value, rule.type === "text");
      if (!s && rule.required) return { error: `${label} is required.` };
      if (rule.min && s && s.length < rule.min) return { error: `${label} is too short.` };
      if (s.length > (rule.max || 200)) return { error: `${label} is too long (max ${rule.max || 200}).` };
      return { value: s };
    }
    case "slug": {
      const s = slugify(value);
      if (!s && rule.required) return { error: `${label} is required.` };
      return { value: s };
    }
    case "email": {
      const s = clean(value, false).toLowerCase();
      if (!s) return rule.required ? { error: `${label} is required.` } : { value: "" };
      return EMAIL.test(s) && s.length <= 200 ? { value: s } : { error: "Enter a valid email address." };
    }
    case "url": {
      const s = clean(value, false);
      if (!s) return rule.required ? { error: `${label} is required.` } : { value: "" };
      try {
        const u = new URL(s);
        if (!/^https?:$/.test(u.protocol) || s.length > 500) throw new Error("bad");
        return { value: u.toString() };
      } catch {
        return { error: "Enter a full link starting with https://" };
      }
    }
    case "boolean":
      return { value: value === true || value === "true" };
    case "int": {
      const n = Number(value);
      if (!Number.isInteger(n)) return { error: `${label} must be a whole number.` };
      if (rule.min != null && n < rule.min) return { error: `${label} must be at least ${rule.min}.` };
      if (rule.max != null && n > rule.max) return { error: `${label} must be at most ${rule.max}.` };
      return { value: n };
    }
    case "enum":
      return rule.values.includes(value) ? { value } : { error: `${label} is not a valid choice.` };
    case "objectId":
      if (value == null || value === "") return rule.required ? { error: `${label} is required.` } : { value: null };
      return isObjectId(value) ? { value } : { error: `${label} is invalid.` };
    case "objectIds": {
      if (!Array.isArray(value)) return { value: [] };
      const ids = [...new Set(value.filter(isObjectId))].slice(0, rule.max || 20);
      return { value: ids };
    }
    case "image":
      return checkImage(value);
    case "list": {
      if (!Array.isArray(value)) return { value: [] };
      const out = [];
      for (const raw of value.slice(0, rule.max || 12)) {
        if (rule.of) {
          // list of strings
          const r = one(key, rule.of, raw);
          if (r.error) return r;
          if (r.value) out.push(r.value);
        } else {
          const { data, errors } = validate(raw && typeof raw === "object" ? raw : {}, rule.item);
          if (Object.keys(errors).length) return { error: `${label}: ${Object.values(errors)[0]}` };
          if (Object.values(data).some(Boolean)) out.push(data);
        }
      }
      return { value: out };
    }
    case "point": {
      const x = Number(value?.x);
      const y = Number(value?.y);
      if (![x, y].every((n) => Number.isFinite(n) && n >= 0 && n <= 100)) return { error: `${label} must be between 0 and 100.` };
      return { value: { x: Math.round(x), y: Math.round(y) } };
    }
    default:
      return { error: `${label} is not supported.` };
  }
}

export function validate(input, rules, { partial = false } = {}) {
  const src = input && typeof input === "object" ? input : {};
  const data = {};
  const errors = {};
  for (const [key, rule] of Object.entries(rules)) {
    if (!(key in src)) {
      if (!partial && rule.required) errors[key] = `${rule.label || key} is required.`;
      continue;
    }
    const r = one(key, rule, src[key]);
    if (r.error) errors[key] = r.error;
    else data[key] = r.value;
  }
  return { data, errors, ok: Object.keys(errors).length === 0 };
}

/** Throws ValidationError (HTTP 422) when the input is invalid. */
export function validateOrThrow(input, rules, options) {
  const result = validate(input, rules, options);
  if (!result.ok) throw new ValidationError(result.errors);
  return result.data;
}
