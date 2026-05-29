"use client";

import { useEffect, useState } from "react";

interface WeatherDay {
  day: string;
  max: number;
  min: number;
  code: number;
}

interface WeatherData {
  current: { temperature: number; code: number };
  daily: WeatherDay[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function codeLabel(c: number): string {
  if (c === 0) return "Clear";
  if (c < 3) return "Partly Cloudy";
  if (c < 50) return "Cloudy";
  if (c < 70) return "Rain";
  if (c < 80) return "Showers";
  return "Storm";
}

function codeIcon(c: number): string {
  if (c === 0) return "☀️";
  if (c < 3) return "⛅";
  if (c < 50) return "☁️";
  if (c < 80) return "🌧️";
  return "⛈️";
}

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

export function WeatherWidget({ lat, lng }: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=4`
    )
      .then((r) => r.json())
      .then((j) => {
        if (cancel) return;
        setData({
          current: {
            temperature: Math.round(j.current.temperature_2m),
            code: j.current.weather_code,
          },
          daily: j.daily.time.slice(0, 4).map((t: string, i: number) => ({
            day: DAY_LABELS[new Date(t).getDay()],
            max: Math.round(j.daily.temperature_2m_max[i]),
            min: Math.round(j.daily.temperature_2m_min[i]),
            code: j.daily.weather_code[i],
          })),
        });
      })
      .catch(() => {
        if (!cancel) setErr("Could not load weather");
      });

    return () => {
      cancel = true;
    };
  }, [lat, lng]);

  if (err) return <div className="text-sm text-foreground/50">{err}</div>;
  if (!data)
    return <div className="h-32 bg-muted/40 rounded-2xl animate-pulse" />;

  return (
    <div className="p-6 bg-foreground text-background rounded-2xl">
      <div className="text-[10px] uppercase tracking-widests text-background/50 mb-3">
        Current Weather
      </div>
      <div className="flex items-end gap-4 mb-6">
        <div className="text-5xl font-light">{data.current.temperature}°C</div>
        <div className="pb-1">
          <div className="text-2xl">{codeIcon(data.current.code)}</div>
          <div className="text-xs text-accent italic font-serif">
            {codeLabel(data.current.code)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-background/10">
        {data.daily.map((d) => (
          <div key={d.day} className="text-center">
            <div className="text-[10px] uppercase text-background/50">
              {d.day}
            </div>
            <div className="text-lg my-1">{codeIcon(d.code)}</div>
            <div className="text-xs">
              {d.max}°<span className="text-background/40">/{d.min}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
