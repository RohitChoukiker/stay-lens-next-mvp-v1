"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("firebase_id_token")
      : null;

  useEffect(() => {
    if (!loading && (!user || !token)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, token, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-foreground/40">
        Loading…
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="min-h-screen grid place-items-center text-foreground/40">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
