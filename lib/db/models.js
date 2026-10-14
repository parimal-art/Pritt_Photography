/**
 * All Mongoose models. Import `connectDB()` first, then use the models.
 *
 *   Admin        the only login account (created by `npm run admin:create`)
 *   Photo        a Cloudinary image + metadata + display position (`order`)
 *   Category     gallery filter / classification, ordered by `order`
 *   Project      curated story with cover photo, ordered by `order`
 *   Service      editable service (title, description, optional image)
 *   Testimonial  genuine client feedback, entered by the admin
 *   Message      contact-form submissions (never exposed publicly)
 *   Setting      one document (key "site") with all editable site content
 */
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ImageSchema = new Schema(
  { url: String, publicId: String, width: Number, height: Number },
  { _id: false }
);

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 }, // bump to invalidate every issued JWT
    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", maxlength: 400 },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

const PhotoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    caption: { type: String, default: "", maxlength: 300 },
    description: { type: String, default: "", maxlength: 2000 },
    alt: { type: String, default: "", maxlength: 300 },
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    project: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    featured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // position in the gallery (lower = earlier)
    location: { type: String, default: "", maxlength: 120 },
    takenAt: { type: String, default: "", maxlength: 20 }, // "2026" or "2026-03-14"
  },
  { timestamps: true }
);
PhotoSchema.index({ published: 1, order: 1 });
PhotoSchema.index({ featured: 1, featuredOrder: 1 });
PhotoSchema.index({ categories: 1, order: 1 });
PhotoSchema.index({ project: 1, order: 1 });

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 2000 },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    date: { type: String, default: "", maxlength: 20 },
    location: { type: String, default: "", maxlength: 120 },
    coverPhoto: { type: Schema.Types.ObjectId, ref: "Photo", default: null },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", maxlength: 600 },
    image: { type: ImageSchema, default: null },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

const TestimonialSchema = new Schema(
  {
    quote: { type: String, required: true, maxlength: 1200 },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    project: { type: String, default: "", maxlength: 120 },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

const MessageSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    subject: { type: String, required: true, maxlength: 160 },
    service: { type: String, default: "", maxlength: 80 },
    message: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
MessageSchema.index({ createdAt: -1 });

const SettingSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    brandName: { type: String, default: "Pritt Photography", maxlength: 80 },
    ownerName: { type: String, default: "", maxlength: 80 },
    heroEyebrow: { type: String, default: "Photographer & visual artist", maxlength: 80 },
    heroHeadline: { type: String, default: "Stories\nTold Through\nLight.", maxlength: 120 },
    heroDescription: { type: String, default: "", maxlength: 400 },
    heroImage: { type: ImageSchema, default: null },
    heroPosition: { x: { type: Number, default: 50 }, y: { type: Number, default: 50 } },
    aboutStatement: { type: String, default: "", maxlength: 300 },
    aboutParagraphs: [{ type: String, maxlength: 1500 }],
    aboutImage: { type: ImageSchema, default: null },
    stats: [{ _id: false, value: { type: String, maxlength: 20 }, label: { type: String, maxlength: 60 } }],
    email: { type: String, default: "", maxlength: 200 },
    phone: { type: String, default: "", maxlength: 40 },
    location: { type: String, default: "", maxlength: 120 },
    availability: { type: String, default: "", maxlength: 120 },
    socials: [{ _id: false, label: { type: String, maxlength: 60 }, url: { type: String, maxlength: 500 } }],
    footerText: { type: String, default: "", maxlength: 300 },
    defaultTheme: { type: String, enum: ["system", "dark", "light"], default: "system" },
    galleryPageSize: { type: Number, default: 12, min: 3, max: 60 },
  },
  { timestamps: true }
);

export const Admin = models.Admin || model("Admin", AdminSchema);
export const Category = models.Category || model("Category", CategorySchema);
export const Photo = models.Photo || model("Photo", PhotoSchema);
export const Project = models.Project || model("Project", ProjectSchema);
export const Service = models.Service || model("Service", ServiceSchema);
export const Testimonial = models.Testimonial || model("Testimonial", TestimonialSchema);
export const Message = models.Message || model("Message", MessageSchema);
export const Setting = models.Setting || model("Setting", SettingSchema);
