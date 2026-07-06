import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "Familjerna Schiffer",
    template: "%s — Familjerna Schiffer",
  },
  description:
    "Familjerna Schiffers hemsida — två familjer i västra Skåne, med rötter i Ungern, Norge, Tyskland och Sverige.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="antialiased min-h-screen flex flex-col">
        <a
          href="#innehall"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-accent focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium"
        >
          Hoppa till innehållet
        </a>
        <Nav />
        <main id="innehall" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
