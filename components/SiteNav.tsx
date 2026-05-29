"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function SiteNav({ hideHotels = false, hideProfile = false } = {}) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12">
        <Link
          href="/"
          className="font-serif text-2xl italic font-bold tracking-tight text-foreground"
        >
          Stay<span className="text-[#B9954A]">Lens</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6 text-sm font-medium">
          {!hideHotels && (
            <Link
              href="/hotels"
              className="hidden md:inline text-foreground/80 hover:text-accent transition-colors"
            >
              Hotels
            </Link>
          )}

          <div className="flex items-center gap-2 md:gap-3 md:border-l md:pl-6 md:border-border">
            {user ? (
              <>
                {!hideProfile && (
                  <Link
                    href="/profile"
                    className="rounded-full px-4 py-2 hover:bg-muted transition-colors"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="rounded-full bg-foreground text-background px-5 py-2 hover:bg-foreground/90 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 hover:bg-muted transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="rounded-full bg-foreground text-background px-5 py-2 hover:bg-foreground/90 transition-colors"
                >
                  Join StayLens
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
