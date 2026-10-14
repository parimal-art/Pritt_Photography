/**
 * Creates the first administrator (and starter content) — run once:
 *
 *   1. Put MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local
 *   2. npm run admin:create
 *   3. Remove ADMIN_PASSWORD from .env.local afterwards
 *
 * Forgot the password?  npm run admin:reset-password   (also signs out every session)
 *
 * There is intentionally no public registration page anywhere in the app.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const reset = process.argv.includes("--reset-password");
const { MONGODB_URI, MONGODB_DB, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (!MONGODB_URI) fail("MONGODB_URI is not set in .env.local");
const email = String(ADMIN_EMAIL || "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail("ADMIN_EMAIL is missing or not a valid email address.");
const password = String(ADMIN_PASSWORD || "");
if (password.length < 12) fail("ADMIN_PASSWORD must be at least 12 characters.");
if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  fail("ADMIN_PASSWORD must contain upper-case, lower-case letters and a number.");
}

const STARTER_CATEGORIES = ["Portraits", "Weddings", "Fashion", "Street", "Travel", "Nature", "Events"];
const STARTER_SERVICES = [
  ["Portraits", "Considered, natural-light portraits for individuals, families and brands."],
  ["Weddings", "Unobtrusive documentary coverage of the day, told as a story."],
  ["Fashion", "Editorial and lookbook work with strong art direction."],
  ["Events", "Launches, celebrations and gatherings, captured candidly."],
  ["Commercial", "Product, brand and campaign imagery with a cinematic eye."],
  ["Travel & Street", "Destination and documentary photography from the road."],
];
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB || undefined, serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db;

try {
  const admins = db.collection("admins");
  const existing = await admins.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  if (existing && !reset) {
    fail(`An administrator with ${email} already exists. Use "npm run admin:reset-password" to change the password.`);
  }

  if (existing) {
    await admins.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, failedLogins: 0, lockUntil: null, updatedAt: now }, $inc: { tokenVersion: 1 } }
    );
    console.log(`\n✔ Password updated for ${email}. All previous sessions were signed out.`);
  } else {
    await admins.insertOne({
      email, passwordHash, tokenVersion: 0, failedLogins: 0, lockUntil: null, lastLoginAt: null, createdAt: now, updatedAt: now, __v: 0,
    });
    console.log(`\n✔ Administrator created: ${email}`);
  }

  // Starter content — only into EMPTY collections, never overwrites anything.
  if ((await db.collection("categories").countDocuments()) === 0) {
    await db.collection("categories").insertMany(
      STARTER_CATEGORIES.map((name, i) => ({ name, slug: slugify(name), description: "", order: i, createdAt: now, updatedAt: now, __v: 0 }))
    );
    console.log("✔ Starter categories added");
  }
  if ((await db.collection("services").countDocuments()) === 0) {
    await db.collection("services").insertMany(
      STARTER_SERVICES.map(([title, description], i) => ({ title, description, image: null, visible: true, order: i, createdAt: now, updatedAt: now, __v: 0 }))
    );
    console.log("✔ Starter services added");
  }
  if ((await db.collection("settings").countDocuments({ key: "site" })) === 0) {
    await db.collection("settings").insertOne({ key: "site", createdAt: now, updatedAt: now, __v: 0 });
    console.log("✔ Default site settings created");
  }

  console.log("\nNext: open /admin on your site and sign in. Remove ADMIN_PASSWORD from .env.local now.\n");
} finally {
  await mongoose.disconnect();
}
