"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/integrations/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "signup">(
    (searchParams.get("mode") as "login" | "signup") ?? "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created! Let's set up your preferences.");
        localStorage.removeItem("onboarding_completed");
        router.push("/onboarding");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back.");
        const onboardingDone = localStorage.getItem("onboarding_completed");
        if (onboardingDone === "true") {
          router.push("/hotels");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google");
      const onboardingDone = localStorage.getItem("onboarding_completed");
      if (onboardingDone === "true") {
        router.push("/hotels");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 bg-foreground text-background relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          <Link
            href="/"
            className="font-serif italic text-3xl font-bold"
          >
            StayLens
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-background/60 mb-3">
              A curated India
            </p>
            <h2 className="font-serif text-4xl xl:text-5xl leading-tight max-w-md">
              Stays as considered as the journey itself.
            </h2>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden font-serif italic text-2xl font-bold mb-10 inline-block"
          >
            StayLens
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3">
            {mode === "signup" ? "Create account" : "Welcome back"}
          </p>
          <h1 className="font-serif text-4xl mb-8">
            {mode === "signup" ? "Join StayLens." : "Sign in."}
          </h1>

          {/* Google */}
          <button
            onClick={google}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-foreground/40">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widests text-foreground/40 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-foreground text-background px-4 py-3.5 text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {busy
                ? "Please wait…"
                : mode === "signup"
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-foreground/60 text-center">
            {mode === "signup"
              ? "Already have an account?"
              : "New to StayLens?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-accent font-medium hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-foreground/40">
          Loading…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
