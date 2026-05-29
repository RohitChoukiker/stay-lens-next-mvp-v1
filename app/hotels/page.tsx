"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HOTELS, ALL_AMENITIES, ALL_VIBES } from "@/lib/hotels";
import HotelChatbot from "@/components/HotelChatbot";

function HotelsListContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(80000);
  const [minStars, setMinStars] = useState(0);
  const [vibe, setVibe] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState<
    "recommended" | "price_asc" | "price_desc" | "rating"
  >("recommended");

  function handleChatFilters(f: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    minStars?: number;
    vibe?: string | null;
    amenities?: string[];
  }) {
    if (f.query !== undefined) setQuery(f.query);
    if (f.minPrice !== undefined) setMinPrice(f.minPrice);
    if (f.maxPrice !== undefined) setMaxPrice(f.maxPrice);
    if (f.minStars !== undefined) setMinStars(f.minStars);
    if ("vibe" in f) setVibe(f.vibe ?? null);
    if (f.amenities !== undefined) setAmenities(f.amenities);
  }

  // State for hotels from Claude
  const [claudeHotels, setClaudeHotels] = useState<any[] | null>(null);
  const [loadingClaude, setLoadingClaude] = useState(false);
  const [claudeError, setClaudeError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client
    const onboarding = typeof window !== "undefined" ? localStorage.getItem("onboarding_answers") : null;
    if (!onboarding) return;
    setLoadingClaude(true);
    fetch("/api/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: JSON.parse(onboarding) })
    })
      .then((res) => res.json())
      .then((data) => {
        // Claude's response may be in data.content (array) or data.completion (string)
        let content = "";
        if (Array.isArray(data.content) && data.content.length > 0) {
          // Find the first text block
          const textBlock = data.content.find((c: any) => c.type === "text" && typeof c.text === "string");
          if (textBlock) content = textBlock.text;
        } else if (typeof data.content === "string") {
          content = data.content;
        } else if (typeof data.completion === "string") {
          content = data.completion;
        }
        // Remove markdown code block if present
        content = content.replace(/^```json|^```|```$/gm, "").trim();
        let jsonStart = content.indexOf("[");
        let jsonEnd = content.lastIndexOf("]");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          try {
            const hotels = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
            setClaudeHotels(hotels);
          } catch (e) {
            // Fallback: try to extract JSON array with regex
            try {
              const match = content.match(/\[([\s\S]*?)\]/);
              if (match) {
                const hotels = JSON.parse(match[0]);
                setClaudeHotels(hotels);
                return;
              }
            } catch {}
            setClaudeError("Could not parse hotels from Claude response.");
          }
        } else {
          setClaudeError("Claude did not return a valid hotel list.");
        }
      })
      .catch(() => setClaudeError("Failed to fetch hotels from Claude."))
      .finally(() => setLoadingClaude(false));
  }, []);

  const list = claudeHotels ?? [];

  const toggleAmenity = (a: string) =>
    setAmenities((arr) =>
      arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a]
    );

  if (loadingClaude) {
    return (
      <div className="min-h-screen grid place-items-center text-foreground/40">
        Loading your top hotels…
      </div>
    );
  }

  if (claudeError) {
    return (
      <div className="min-h-screen grid place-items-center text-red-500">
        {claudeError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-12 pb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3">
          Stays
        </p>
        <h1 className="font-serif text-4xl md:text-5xl mb-2">
          Curated for India.
        </h1>
        <p className="text-foreground/60">
          {list.length} hotels matching your preferences.
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-6 md:px-12 pb-20 grid lg:grid-cols-[280px_1fr] gap-10">
        {/* Results Grid */}
        <div className="col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            {list.map((h) => (
              <Link
                key={h.id}
                href={`/hotels/${h.id}`}
                className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-[var(--shadow-luxe)] transition-shadow"
              >
                <div className="aspect-[5/4] bg-muted overflow-hidden">
                  <img
                    src={h.images?.[0] || "/images/placeholder.jpg"}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {h.vibe}
                    </span>
                    <span className="text-xs text-foreground/50">
                      ★ {h.rating} · {h.reviewCount} reviews
                    </span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
                    {h.name}
                  </h3>
                  <p className="text-sm text-foreground/55 mb-4">
                    {h.city}, {h.state}
                  </p>
                  <p className="text-sm text-foreground/70 line-clamp-2 mb-4">
                    {h.tagline}
                  </p>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-wrap gap-1">
                      {(h.amenities || []).slice(0, 3).map((a: string) => (
                        <span
                          key={a}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground/60"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        ₹{h.pricePerNight?.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-foreground/40 uppercase tracking-widest">
                        per night
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {list.length === 0 && (
            <div className="py-24 text-center text-foreground/50">
              No hotels match your preferences. Try onboarding again!
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
      <HotelChatbot onFiltersChange={handleChatFilters} />
    </div>
  );
}

// Suspense wrapper required for useSearchParams in Next.js
export default function HotelsListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-foreground/40">
          Loading…
        </div>
      }
    >
      <HotelsListContent />
    </Suspense>
  );
}
