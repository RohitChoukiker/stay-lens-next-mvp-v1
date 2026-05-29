"use client";

import { useEffect, useRef } from "react";

interface LeafletMapProps {
  lat: number;
  lng: number;
  label: string;
}

export function LeafletMap({ lat, lng, label }: LeafletMapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let map: any;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !ref.current) return;

      // Fix default marker icon path issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(ref.current, { scrollWheelZoom: false }).setView(
        [lat, lng],
        14
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.marker([lat, lng]).addTo(map).bindPopup(label).openPopup();
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [lat, lng, label]);

  return (
    <div
      ref={ref}
      className="w-full h-full rounded-2xl overflow-hidden bg-muted"
    />
  );
}
