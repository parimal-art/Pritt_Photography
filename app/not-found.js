import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-serif text-[clamp(48px,8vw,120px)] leading-none">Out of frame</h1>
      <p className="max-w-md text-mute">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-outline">
        Back to home
      </Link>
    </div>
  );
}
