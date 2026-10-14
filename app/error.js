"use client";

export default function GlobalError({ reset }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="font-serif text-[clamp(40px,6vw,88px)] leading-none">The shutter jammed</h1>
      <p className="max-w-md text-mute">An unexpected error occurred. Please try again.</p>
      <button type="button" onClick={() => reset()} className="btn-outline">
        Try again
      </button>
    </div>
  );
}
