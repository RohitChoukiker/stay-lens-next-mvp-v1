"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LeafletMap } from "@/components/LeafletMap";
import { WeatherWidget } from "@/components/WeatherWidget";
import { getHotel, type Hotel } from "@/lib/hotels";

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = params?.hotelId as string;
  const hotel = getHotel(hotelId ?? "");

  if (!hotel) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <p className="font-serif text-4xl mb-4">Hotel not found.</p>
          <Link href="/hotels" className="text-accent underline">
            Back to all hotels
          </Link>
        </div>
      </div>
    );
  }

  return <HotelDetail hotel={hotel} />;
}

function HotelDetail({ hotel }: { hotel: Hotel }) {
  const [activeImage, setActiveImage] = useState(0);
  const breakdown = hotel.ratingBreakdown as Record<string, number>;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero Gallery */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 pt-8">
        <Link
          href="/hotels"
          className="text-sm text-foreground/50 hover:text-foreground"
        >
          ← All hotels
        </Link>
        <div className="mt-6 grid gap-2 md:grid-cols-4 md:grid-rows-2 h-[60vh]">
          <div className="md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden bg-muted">
            <img
              src={hotel.images[activeImage]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          {hotel.images.slice(1, 5).map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i + 1)}
              className="rounded-2xl overflow-hidden bg-muted relative group"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-16 grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Left column */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                {hotel.vibe}
              </span>
              <span className="text-foreground/40 text-sm">
                ★ {hotel.rating} · {hotel.reviewCount} reviews · {hotel.stars}
                -star
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl mb-3">
              {hotel.name}
            </h1>
            <p className="text-foreground/60 text-lg">
              {hotel.city}, {hotel.state} · {hotel.address}
            </p>
          </div>

          <p className="text-lg leading-relaxed text-foreground/80 max-w-2xl">
            {hotel.description}
          </p>

          {/* Amenities */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-foreground/40 mb-4">
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((a) => (
                <span key={a} className="px-3 py-1.5 rounded-full bg-muted text-sm">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-foreground/40 mb-4">
              Room types
            </h3>
            <div className="space-y-3">
              {hotel.rooms.map((r) => (
                <div
                  key={r.name}
                  className="flex justify-between items-start p-5 border border-border rounded-2xl"
                >
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-foreground/60 mt-1">
                      {r.description}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-bold">
                      ₹{r.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-foreground/40 uppercase tracking-widest">
                      per night
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-foreground/40 mb-4">
              Location
            </h3>
            <div className="h-80 rounded-2xl overflow-hidden border border-border">
              <LeafletMap lat={hotel.lat} lng={hotel.lng} label={hotel.name} />
            </div>
          </div>

          {/* Nearby attractions */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-foreground/40 mb-4">
              Nearby attractions
            </h3>
            <ul className="divide-y divide-border border-y border-border">
              {hotel.attractions.map((a) => (
                <li
                  key={a.name}
                  className="py-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-foreground/50">{a.type}</div>
                  </div>
                  <div className="text-sm text-foreground/60">
                    {a.distanceKm} km
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Review summary */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-foreground/40 mb-4">
              What guests say
            </h3>
            <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
              <div>
                <div className="font-serif text-7xl italic">{hotel.rating}</div>
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 mt-1">
                  Exceptional
                </div>
                <div className="text-xs text-foreground/50 mt-1">
                  {hotel.reviewCount} reviews
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {Object.entries(breakdown).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-4">
                    <span className="text-xs text-foreground/60 w-20 capitalize">
                      {k}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${(v / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">
                      {v.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-8 text-foreground/75 leading-relaxed max-w-2xl italic font-serif text-lg">
              &ldquo;{hotel.reviewSummary}&rdquo;
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="p-6 bg-card border border-border rounded-3xl shadow-[var(--shadow-luxe)]">
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">
                  From
                </div>
                <div className="text-3xl font-bold">
                  ₹{hotel.pricePerNight.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-foreground/50">per night</div>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="p-4 border border-border rounded-xl">
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">
                  Dates
                </div>
                <div className="text-sm font-medium">Add dates</div>
              </div>
              <div className="p-4 border border-border rounded-xl">
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">
                  Guests
                </div>
                <div className="text-sm font-medium">2 Adults · 1 Room</div>
              </div>
            </div>
            <button className="w-full bg-foreground text-background rounded-xl py-4 font-semibold hover:bg-foreground/90 transition-colors">
              Reserve your stay
            </button>
            <p className="text-[10px] text-center text-foreground/40 mt-3 uppercase tracking-widest">
              Free cancellation 48h before check-in
            </p>
          </div>

          <WeatherWidget lat={hotel.lat} lng={hotel.lng} />
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}
