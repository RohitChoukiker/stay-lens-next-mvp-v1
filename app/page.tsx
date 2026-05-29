"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HOTELS } from "@/lib/hotels";

export default function HomePage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/hotels${destination ? `?q=${encodeURIComponent(destination)}` : ""}`
    );
  };

  const featured = HOTELS.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 px-6 md:px-12 pt-16 md:pt-24 pb-20">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-10 max-w-4xl text-white">
              Find a stay that{" "}
              <span className="italic text-amber-400">actually</span> fits you.
            </h1>

            <form
              onSubmit={onSearch}
              className="bg-white rounded-2xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-2 shadow-2xl"
            >
              <div className="flex-1 px-4 md:px-6 py-2 md:border-r border-gray-200">
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  Destination
                </label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  type="text"
                  placeholder="Udaipur, Goa, Coorg…"
                  className="w-full bg-transparent font-medium focus:outline-none text-gray-800 placeholder:text-gray-300"
                />
              </div>
              <div className="flex-1 px-4 md:px-6 py-2 md:border-r border-gray-200">
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  Check in — Out
                </label>
                <div className="font-medium text-gray-400">Anytime</div>
              </div>
              <button
                type="submit"
                className="bg-accent text-accent-foreground px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.99] transition-transform whitespace-nowrap"
              >
                Search Stays
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Curated section */}
      <section className="px-6 md:px-12 py-20 bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3">
                The Collection
              </p>
              <h2 className="font-serif text-4xl md:text-5xl">
                Stays we&apos;d book ourselves.
              </h2>
            </div>
            <Link
              href="/hotels"
              className="text-sm font-medium underline-offset-4 hover:underline text-accent"
            >
              View all hotels →
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featured.map((h) => (
              <Link key={h.id} href={`/hotels/${h.id}`} className="group block">
                <div className="overflow-hidden rounded-2xl mb-5 aspect-[4/5] bg-muted ring-1 ring-black/5">
                  <img
                    src={h.images[0]}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {h.vibe}
                      </span>
                      <span className="text-foreground/40 text-xs">
                        ★ {h.rating}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-accent transition-colors">
                      {h.name}
                    </h3>
                    <p className="text-sm text-foreground/50">
                      {h.city}, {h.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ₹{h.pricePerNight.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-foreground/40 uppercase tracking-widest">
                      per night
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="px-6 md:px-12 py-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-12">
          {[
            {
              k: "01",
              title: "Personalised, not generic",
              body: "Eight quick questions and your list re-orders around what you actually want.",
            },
            {
              k: "02",
              title: "Hand-picked, hotel-only",
              body: "No flights, no buses. Just hotels — every one inspected by our team.",
            },
            {
              k: "03",
              title: "Map, weather, attractions",
              body: "Every detail page tells you what's around, the weather today, and what guests really thought.",
            },
          ].map((b) => (
            <div key={b.k}>
              <div className="text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
                {b.k}
              </div>
              <h3 className="font-serif text-2xl mb-3">{b.title}</h3>
              <p className="text-foreground/60 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
