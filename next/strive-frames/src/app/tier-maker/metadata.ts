import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Guilty Gear Strive Tier List Maker | Create and Share Character Tier Lists",
  description:
    "Create, customize, and share Guilty Gear Strive character tier lists. Drag and drop characters, customize tiers, and share your rankings with the community.",
  keywords:
    "Guilty Gear Strive, tier list, tier maker, character ranking, GG Strive, fighting games, FGC",
  openGraph: {
    title: "Guilty Gear Strive Tier List Maker",
    description:
      "Create and share your Guilty Gear Strive character tier lists with the community.",
    type: "website",
    url: "https://strive-frames.vercel.app/tier-maker",
    images: [
      {
        url: "/og-tier-maker.jpg",
        width: 1200,
        height: 630,
        alt: "Guilty Gear Strive Tier List Maker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guilty Gear Strive Tier List Maker",
    description:
      "Create and share your Guilty Gear Strive character tier lists with the community.",
    images: ["/og-tier-maker.jpg"],
  },
};
