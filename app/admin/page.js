import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginForm from "@/components/admin/LoginForm";
import ThemeToggle from "@/components/ui/ThemeToggle";

/** /admin — the login page. Already signed in? Straight to the dashboard. */
export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin/dashboard");
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-semibold uppercase tracking-caps text-mute">Private area</p>
        <h1 className="mt-3 font-serif text-[56px] leading-none">Sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
