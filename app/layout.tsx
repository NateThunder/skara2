import type { Metadata } from "next";
import { Geist_Mono, Inter, Outfit } from "next/font/google";
import CookieConsent from "@/app/components/CookieConsent";
import "./globals.css";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfitDisplay = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skaraceilidh.com"),
  title: {
    default: "Skara Ceilidh Band | Ceilidh Band in Scotland",
    template: "%s | Skara Ceilidh Band",
  },
  description:
    "Skara is a high-energy ceilidh band in Scotland for weddings, parties, and corporate events. Check availability and book your date.",
  keywords: [
    "ceilidh band scotland",
    "ceilidh bands in scotland",
    "wedding ceilidh band scotland",
    "live ceilidh music scotland",
    "scottish ceilidh band",
    "Skara Ceilidh Band",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://skaraceilidh.com/",
    siteName: "Skara Ceilidh Band",
    title: "Skara Ceilidh Band | Ceilidh Band in Scotland",
    description:
      "Live ceilidh band in Scotland for weddings, parties, and events. High-energy sets with fiddle, pipes, guitar, and drums.",
    images: [
      {
        url: "/thumbnail.png",
        width: 1600,
        height: 980,
        alt: "Skara Ceilidh Band",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skara Ceilidh Band | Ceilidh Band in Scotland",
    description:
      "Live ceilidh band in Scotland for weddings, parties, and events. Check availability and book your date.",
    images: ["/thumbnail.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${interSans.variable} ${geistMono.variable} ${outfitDisplay.variable} antialiased`}
      >
        <CookieConsent />
        {children}
      </body>
    </html>
  );
}
