/**
 * JWT helpers (jose, HS256). Edge-safe: this file is imported by middleware.js,
 * so it must not import mongoose, bcrypt or any Node-only module.
 */
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "pp_admin_session";
export const SESSION_SECONDS = 60 * 60 * 8; // 8 hours
const ISSUER = "pritt-photography";
const AUDIENCE = "admin";

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing or shorter than 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

/** @param {{sub: string, email: string, ver: number}} claims */
export async function signToken({ sub, email, ver }) {
  return new SignJWT({ email, ver, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());
}

/** Returns the verified payload, or null for a missing / invalid / expired token. */
export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}
