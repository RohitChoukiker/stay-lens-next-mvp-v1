import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 text-sm md:grid-cols-4 md:px-12">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="font-serif text-2xl font-bold italic tracking-tight text-foreground"
          >
            Stay<span className="text-[#B9954A]">Lens</span>
          </Link>
          <p className="mt-4 leading-relaxed text-foreground/60">
            India&apos;s curated hotel collection. Stays that fit who you are,
            not who you&apos;re booking for.
          </p>
        </div>

        {/* Explore */}
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-widests text-foreground/40">
            Explore
          </div>
          <ul className="space-y-2 text-foreground/70">
            {["Rajasthan", "Goa", "Himachal", "Karnataka"].map((place) => (
              <li key={place}>
                <Link
                  href={`/hotels?q=${encodeURIComponent(place)}`}
                  className="transition-colors hover:text-accent"
                >
                  {place}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widests text-foreground/40 mb-4">
            Company
          </div>
          <ul className="space-y-2 text-foreground/70">
            {["About", "Press", "Careers", "Contact"].map((item) => (
              <li key={item}>
                <span className="cursor-pointer hover:text-accent transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-widests text-foreground/40">
            Legal
          </div>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link href="/privacy" className="transition-colors hover:text-accent">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-accent">
                Terms
              </Link>
            </li>
            <li>
              <span className="cursor-pointer transition-colors hover:text-accent">
                Cookies
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-foreground/40">
        © 2026 StayLens India. Crafted with care.
      </div>
    </footer>
  );
}
