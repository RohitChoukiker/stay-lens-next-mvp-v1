"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import HotelChatbot from "@/components/HotelChatbot";

// ─── Types ────────────────────────────────────────────────────────────────────

type Hotel = {
  id: string;
  name: string;
  city: string;
  state: string;
  vibe: string;
  stars: number;
  rating: number;
  reviewCount: number;
  tagline: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  matchReasons?: string[];
};

type SortOption = "recommended" | "price_asc" | "price_desc" | "rating";

// ─── Filter helpers ────────────────────────────────────────────────────────────

function applyFilters(
  hotels: Hotel[],
  {
    query,
    minPrice,
    maxPrice,
    minStars,
    vibe,
    amenities,
    sort,
  }: {
    query: string;
    minPrice: number;
    maxPrice: number;
    minStars: number;
    vibe: string | null;
    amenities: string[];
    sort: SortOption;
  }
): Hotel[] {
  let result = [...hotels];

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.vibe.toLowerCase().includes(q) ||
        h.tagline.toLowerCase().includes(q)
    );
  }

  result = result.filter(
    (h) => h.pricePerNight >= minPrice && h.pricePerNight <= maxPrice
  );

  if (minStars > 0) {
    result = result.filter((h) => h.stars >= minStars);
  }

  if (vibe) {
    result = result.filter((h) =>
      h.vibe.toLowerCase().includes(vibe.toLowerCase())
    );
  }

  if (amenities.length > 0) {
    result = result.filter((h) =>
      amenities.every((a) =>
        h.amenities.some((ha) => ha.toLowerCase().includes(a.toLowerCase()))
      )
    );
  }

  switch (sort) {
    case "price_asc":
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
      break;
    case "price_desc":
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    // "recommended" = Claude's original order, no sort needed
  }

  return result;
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card animate-pulse">
      <div className="aspect-[5/4] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-muted rounded-full w-1/3" />
        <div className="h-5 bg-muted rounded-full w-2/3" />
        <div className="h-3 bg-muted rounded-full w-1/2" />
        <div className="h-3 bg-muted rounded-full w-full" />
        <div className="h-3 bg-muted rounded-full w-4/5" />
        <div className="flex justify-between pt-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-16 bg-muted rounded-full" />
            ))}
          </div>
          <div className="h-6 w-20 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Hotel card ────────────────────────────────────────────────────────────────

function HotelCard({ hotel }: { hotel: Hotel }) {
  const imgSrc =
    Array.isArray(hotel.images) && hotel.images[0]
      ? hotel.images[0]
      : "/images/placeholder.jpg";

  return (
    <div className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-[var(--shadow-luxe)] transition-shadow">
      <div className="aspect-[5/4] bg-muted overflow-hidden">
        <img
          src={imgSrc}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/placeholder.jpg";
          }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {hotel.vibe}
          </span>
          <span className="text-xs text-foreground/50">
            {"★".repeat(hotel.stars)}{" "}
            · {hotel.rating.toFixed(1)} · {hotel.reviewCount.toLocaleString("en-IN")} reviews
          </span>
        </div>

        <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
          {hotel.name}
        </h3>
        <p className="text-sm text-foreground/55 mb-3">
          {hotel.city}, {hotel.state}
        </p>
        <p className="text-sm text-foreground/70 line-clamp-2 mb-4">
          {hotel.tagline}
        </p>

        {/* Match reasons */}
        {hotel.matchReasons && hotel.matchReasons.length > 0 && (
          <ul className="mb-4 space-y-1">
            {hotel.matchReasons.slice(0, 2).map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-xs text-foreground/60">
                <span className="text-accent mt-0.5">✦</span>
                {r}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between items-end">
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground/60"
              >
                {a}
              </span>
            ))}
          </div>
          <div className="text-right shrink-0 ml-2">
            <div className="font-bold">
              ₹{hotel.pricePerNight.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-foreground/40 uppercase tracking-widest">
              per night
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main content ──────────────────────────────────────────────────────────────

function HotelsListContent() {
  const searchParams = useSearchParams();

  // ── Filter state ─────────────────────────────────────────────────────────
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(80000);
  const [minStars, setMinStars] = useState(0);
  const [vibe, setVibe] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("recommended");

  // ── Data state ───────────────────────────────────────────────────────────
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch from Claude API on mount ───────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("onboarding_answers");
    if (!stored) {
      setError("No onboarding answers found. Please complete onboarding first.");
      setLoading(false);
      return;
    }

    fetch("/api/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: JSON.parse(stored) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data.hotels)) {
          throw new Error("Unexpected response format from API.");
        }
        setAllHotels(data.hotels);
      })
      .catch((err) => setError(err.message ?? "Failed to load hotels."))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived: unique vibes & amenities from Claude's hotels ───────────────
  const allVibes = useMemo(
    () => [...new Set(allHotels.map((h) => h.vibe))],
    [allHotels]
  );
  const allAmenities = useMemo(
    () => [...new Set(allHotels.flatMap((h) => h.amenities))].sort(),
    [allHotels]
  );
  const priceRange = useMemo(() => {
    if (allHotels.length === 0) return { min: 0, max: 80000 };
    return {
      min: Math.min(...allHotels.map((h) => h.pricePerNight)),
      max: Math.max(...allHotels.map((h) => h.pricePerNight)),
    };
  }, [allHotels]);

  // ── Apply all filters ────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      applyFilters(allHotels, {
        query,
        minPrice,
        maxPrice,
        minStars,
        vibe,
        amenities,
        sort,
      }),
    [allHotels, query, minPrice, maxPrice, minStars, vibe, amenities, sort]
  );

  // ── Chatbot filter bridge ────────────────────────────────────────────────
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

  // ── Filter helpers ───────────────────────────────────────────────────────
  const toggleAmenity = (a: string) =>
    setAmenities((arr) =>
      arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a]
    );

  const clearFilters = () => {
    setQuery("");
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setMinStars(0);
    setVibe(null);
    setAmenities([]);
    setSort("recommended");
  };

  const hasActiveFilters =
    query ||
    minStars > 0 ||
    vibe ||
    amenities.length > 0 ||
    sort !== "recommended" ||
    minPrice > priceRange.min ||
    maxPrice < priceRange.max;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-7xl px-6 md:px-12 pt-12 pb-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3">Stays</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-2">Curated for India.</h1>
          <p className="text-foreground/60 animate-pulse">Finding your perfect hotels…</p>
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-12 pb-20 grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-9 bg-muted rounded-xl" />
                <div className="h-9 bg-muted rounded-xl" />
              </div>
            ))}
          </aside>
          {/* Grid skeleton */}
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="min-h-[60vh] grid place-items-center px-6">
          <div className="text-center max-w-sm">
            <p className="text-4xl mb-4">🏨</p>
            <h2 className="font-serif text-2xl mb-2">Something went wrong</h2>
            <p className="text-foreground/60 text-sm mb-6">{error}</p>
            <a
              href="/onboarding"
              className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Redo Onboarding
            </a>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Page header */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-12 pb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3">Stays</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-2">Curated for India.</h1>
        <p className="text-foreground/60">
          {filtered.length} of {allHotels.length} hotels matching your preferences
          {hasActiveFilters && " · filtered"}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-12 pb-20 grid lg:grid-cols-[280px_1fr] gap-10">

        {/* ── Filters sidebar ──────────────────────────────────────────── */}
        <aside className="hidden lg:block self-start sticky top-6 space-y-7">

          {/* Search */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hotel, city, vibe…"
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
              Sort by
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="recommended">Best match</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* Price range */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
              Price per night
            </label>
            <div className="flex items-center gap-2 text-sm text-foreground/70 mb-2">
              <span>₹{minPrice.toLocaleString("en-IN")}</span>
              <span className="flex-1 text-center text-foreground/30">–</span>
              <span>₹{maxPrice.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
              Min. stars
            </label>
            <div className="flex gap-1.5">
              {[0, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setMinStars(s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    minStars === s
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted border-border text-foreground/60 hover:border-foreground/40"
                  }`}
                >
                  {s === 0 ? "Any" : `${s}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          {allVibes.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
                Vibe
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allVibes.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVibe(vibe === v ? null : v)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      vibe === v
                        ? "bg-accent text-white border-accent"
                        : "bg-muted border-border text-foreground/60 hover:border-foreground/40"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {allAmenities.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
                Amenities
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allAmenities.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      amenities.includes(a)
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted border-border text-foreground/60 hover:border-foreground/40"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full text-xs font-medium text-foreground/50 hover:text-foreground py-2 border border-dashed border-border rounded-xl transition-colors"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* ── Hotels grid ──────────────────────────────────────────────── */}
        <div>
          {/* Mobile search bar */}
          <div className="lg:hidden mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hotels, cities…"
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((h) => (
                <HotelCard key={h.id} hotel={h} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-foreground/50">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-medium mb-1">No hotels match these filters.</p>
              <button
                onClick={clearFilters}
                className="text-sm text-accent underline underline-offset-2 mt-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
      <HotelChatbot onFiltersChange={handleChatFilters} />
    </div>
  );
}

// ─── Page wrapper (Suspense required for useSearchParams) ─────────────────────

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