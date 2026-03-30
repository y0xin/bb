// Final deployment fix for Vercel
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import YandexMetrica from "@/components/YandexMetrica";
import { generateOrganizationJsonLd } from "@/lib/schema";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "PRO MARKET — Премиальный Маркетплейс",
    template: "%s | PRO MARKET",
  },
  description:
    "Современный онлайн-каталог электроники и аксессуаров. Тысячи товаров, быстрая доставка и безопасная оплата.",
  keywords: ["онлайн-магазин", "каталог", "электроника", "смартфоны", "PRO MARKET"],
  authors: [{ name: "PRO MARKET Team" }],
  robots: "index, follow",
  openGraph: {
    title: "PRO MARKET — Премиальный Маркетплейс",
    description: "Качественные товары, чат с экспертами и быстрая доставка.",
    url: "https://promarket.ru",
    siteName: "PRO MARKET",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PRO MARKET",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRO MARKET — Премиальный Маркетплейс",
    description: "Современный онлайн-каталог электроники.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationJsonLd();

  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <YandexMetrica />
      </body>
    </html>
  );
}

