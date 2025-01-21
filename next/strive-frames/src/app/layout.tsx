import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fgc-stats.com'),
  title: {
    default: 'Strive Frames | Guilty Gear Strive Frame Data and Tools',
    template: '%s | Strive Frames'
  },
  description: 'Comprehensive Guilty Gear Strive frame data, move properties, and community tools. Explore character data, create tier lists, and improve your game.',
  keywords: 'Guilty Gear Strive, frame data, fighting games, FGC, move properties, game mechanics, GG Strive',
  authors: [{ name: 'Strive Frames Team' }],
  creator: 'Guilty Gear Strive Community',
  publisher: 'Strive Frames',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Strive Frames',
    title: 'Strive Frames | Guilty Gear Strive Frame Data and Tools',
    description: 'Comprehensive Guilty Gear Strive frame data, move properties, and community tools.',
    images: [
      {
        url: '/og-default.jpg', // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'Strive Frames'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strive Frames | Guilty Gear Strive Frame Data and Tools',
    description: 'Comprehensive Guilty Gear Strive frame data, move properties, and community tools.',
    images: ['/og-default.jpg'],
    creator: '@striveframes' // Replace with actual Twitter handle if you have one
  },
  alternates: {
    canonical: 'https://www.fgc-stats.com',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navigation />
        <main className="flex-grow bg-gray-50">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
