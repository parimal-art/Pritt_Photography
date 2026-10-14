# Pritt Photography — v2 (MongoDB Atlas + Cloudinary + JWT)

Next.js 15 (App Router, JavaScript), Tailwind, GSAP, Swiper, Framer Motion.

## 1. Setup

```bash
npm install
cp .env.example .env.local      # then fill in the values
npm run admin:create            # creates your admin (reads ADMIN_EMAIL / ADMIN_PASSWORD)
npm run dev                     # http://localhost:3000
```

### MongoDB Atlas
1. Create a free cluster, then a database user (Database Access).
2. Network Access → allow your IP (and `0.0.0.0/0` for Vercel, or Atlas's Vercel integration).
3. Connect → Drivers → copy the string into `MONGODB_URI` (put the database name, e.g. `/pritt-photography`, before the `?`).

### JWT
`JWT_SECRET` must be 32+ random characters:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Admin account
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ chars, upper + lower + digit) in `.env.local`, run `npm run admin:create`, then **delete `ADMIN_PASSWORD`** from the file.
- Forgot password: set `ADMIN_PASSWORD` again and run `npm run admin:reset-password`.
- There is no public registration.

### Cloudinary
Dashboard → copy cloud name, API key, API secret into `.env.local`. Uploads go straight from the browser to Cloudinary using a server-signed request (the secret never reaches the browser). Photos are stored in `<CLOUDINARY_FOLDER>/gallery`, site images in `<CLOUDINARY_FOLDER>/site`.

## 2. Using the admin

Open `/admin` (no link to it exists on the public site). Sign in, then:

- **Gallery** – Upload (multi-file, previews, progress), edit title/caption/alt/category/project/location/date, delete with confirmation (the Cloudinary file is removed too unless still used elsewhere), search, filter, paginate, **replace image**.
- **Photo order** – drag and drop, up/down arrows, or type an exact **Position** in the edit dialog.
- **Featured Work** – toggle a photo as featured, then order it under Featured Work.
- **Landing page image** – Settings → *Landing page hero*: upload the photo, set the focal point, edit the headline (last line shows in italic), location and availability. You can also use "Use as hero" on any gallery photo.
- **Categories, Projects, Services, Testimonials** – full CRUD with images and ordering.
- **Contact Messages** – submissions are saved in MongoDB (optional e-mail alert through Resend).
- **Settings** – brand, hero, about, contact, socials, default theme, gallery page size, footer.

Dark/light: the sun/moon button saves the visitor's choice; the admin "default theme" only applies to first-time visitors.

## 3. Deploy (Vercel)
Add every variable from `.env.example` in Project → Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` to your domain, deploy, and run `npm run admin:create` once locally against the same Atlas database.

## 4. Security notes
- JWT (HS256) in an HTTP-only, SameSite cookie (Secure in production); verified in middleware and again against the database.
- Logout invalidates all sessions for that admin (token version).
- Login rate limit + per-account lockout, bcrypt (cost 12), same-origin check on writes, `no-store` + `noindex` on admin.
- Uploads are re-verified server-side (folder, format, size ≤ 25 MB).
- Never commit `.env.local`.
