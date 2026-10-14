/**
 * MongoDB Atlas connection (Mongoose). The connection is cached on globalThis so
 * hot reloads in development and warm serverless invocations reuse it.
 */
import mongoose from "mongoose";

const cache = (globalThis.__prittMongo ||= { conn: null, promise: null });

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectDB() {
  if (!isDbConfigured()) throw new Error("MONGODB_URI is not set.");
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // allow a retry on the next request
    throw err;
  }
  return cache.conn;
}
