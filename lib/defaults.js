/**
 * Fallback content used when a setting has not been filled in (or the database is
 * unreachable). Everything here is editable from the admin panel afterwards.
 */
export const DEFAULT_SETTINGS = {
  brandName: "Pritt Photography",
  ownerName: "",
  heroEyebrow: "Photographer & visual artist",
  heroHeadline: "Stories\nTold Through\nLight.",
  heroDescription:
    "Capturing fleeting moments and transforming them into timeless visual stories.",
  heroImage: null,
  heroPosition: { x: 50, y: 50 },
  aboutStatement:
    "I photograph the quiet moment before the picture — the breath, the glance, the light settling in.",
  aboutParagraphs: [],
  aboutImage: null,
  stats: [],
  email: "",
  phone: "",
  location: "",
  availability: "",
  socials: [],
  footerText: "",
  defaultTheme: "system",
  galleryPageSize: 12,
};

export const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/#contact" },
];

/** Created by `npm run admin:create` the first time, then fully editable. */
export const STARTER_CATEGORIES = [
  "Portraits",
  "Weddings",
  "Fashion",
  "Street",
  "Travel",
  "Nature",
  "Events",
];

export const STARTER_SERVICES = [
  { title: "Portraits", description: "Considered, natural-light portraits for individuals, families and brands." },
  { title: "Weddings", description: "Unobtrusive documentary coverage of the day, told as a story." },
  { title: "Fashion", description: "Editorial and lookbook work with strong art direction." },
  { title: "Events", description: "Launches, celebrations and gatherings, captured candidly." },
  { title: "Commercial", description: "Product, brand and campaign imagery with a cinematic eye." },
  { title: "Travel & Street", description: "Destination and documentary photography from the road." },
];
