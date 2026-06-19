import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cozy Tops — a one-of-one top, designed from your vibe",
  description:
    "Drop your Instagram handle and Cozy Tops reads your style, then designs a custom sweater, tee, or jacket made just for you.",
  openGraph: {
    title: "Cozy Tops",
    description:
      "A custom sweater, tee, or jacket designed from your Instagram style.",
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
