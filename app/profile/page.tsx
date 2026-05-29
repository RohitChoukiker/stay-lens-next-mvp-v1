"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { HOTELS } from "@/lib/hotels";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedHotels, setSavedHotels] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem("saved_hotels") || "[]");
    setSavedHotels(HOTELS.filter((h) => saved.includes(h.id)));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-foreground/40">
        Loading…
      </div>
    );
  }

  // NOTE: updateDoc/db calls require firebase/firestore imports in your project
  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // import { doc, updateDoc } from "firebase/firestore";
      // import { db } from "@/integrations/firebase/client";
      // await updateDoc(doc(db, "profiles", user.uid), { display_name: displayName });
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="mx-auto max-w-3xl px-6 md:px-12 py-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3">
          Account
        </p>
        <h1 className="font-serif text-5xl mb-12">Your profile.</h1>

        <div className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widests text-foreground/40 mb-2">
              Email
            </label>
            <div className="text-foreground/80">{user.email}</div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widests text-foreground/40 mb-2">
              User ID
            </label>
            <div className="text-foreground/80">{user.uid}</div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widests text-foreground/40 mb-2">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full max-w-md rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-accent"
            />
            <button
              onClick={save}
              disabled={saving}
              className="mt-3 rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          {/* Saved Hotels */}
          <div>
            <div className="text-[10px] uppercase tracking-widests text-foreground/40 mb-3">
              Saved Hotels
            </div>
            {savedHotels.length === 0 ? (
              <div className="text-foreground/60">No hotels saved yet.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {savedHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="p-4 border border-border rounded-xl flex flex-col"
                  >
                    <div className="font-medium text-lg mb-1">{hotel.name}</div>
                    <div className="text-sm text-foreground/60 mb-2">
                      {hotel.city}, {hotel.state}
                    </div>
                    <div className="text-xs text-foreground/40 mb-2">
                      {hotel.tagline}
                    </div>
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="rounded-lg mb-2 h-32 object-cover"
                    />
                    <div className="text-sm font-semibold">
                      ₹{hotel.pricePerNight.toLocaleString()} / night
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Travel preferences */}
          {profile && (
            <div>
              <div className="text-[10px] uppercase tracking-widests text-foreground/40 mb-3">
                Travel preferences
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {(
                  [
                    ["Budget", profile.budget_range],
                    ["Trip type", profile.trip_type],
                    ["Vibe", profile.location_vibe],
                    ["Travelers", profile.traveler_count],
                    ["Date flexibility", profile.date_flexibility],
                    ["Food", profile.food_preference],
                    ["Room type", profile.room_type],
                    ["Amenities", profile.preferred_amenities?.join(", ")],
                  ] as [string, string | undefined][]
                ).map(([k, v]) => (
                  <div key={k} className="p-4 border border-border rounded-xl">
                    <div className="text-[10px] uppercase tracking-widests text-foreground/40">
                      {k}
                    </div>
                    <div className="mt-1 font-medium">{v || "—"}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push("/onboarding")}
                className="mt-4 text-accent text-sm font-medium hover:underline"
              >
                Re-take onboarding
              </button>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
