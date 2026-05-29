import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "StayLens — Curated Hotels in India",
  description: "India's curated hotel collection. Stays that fit who you are.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
