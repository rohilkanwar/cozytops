import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cozy Tops — Atelier · a one-of-one piece, designed from your style",
  description:
    "Share an Instagram handle and Cozy Tops reads your style, then designs a bespoke sweater, tee, or jacket — cut, stitched, and shipped by a partner atelier.",
  openGraph: {
    title: "Cozy Tops Atelier",
    description:
      "A bespoke sweater, tee, or jacket, designed from your Instagram style.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
