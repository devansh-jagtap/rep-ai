import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Instrument_Serif, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mimick.me";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "MimicK — AI Portfolio Builder",
    template: "%s | MimicK",
  },
  description:
    "Create an AI-powered portfolio with lead capture, chat, analytics, and conversion tools in minutes.",
  keywords: ["portfolio", "ai portfolio", "lead capture", "freelancer", "creator website"],
  openGraph: {
    title: "MimicK — AI Portfolio Builder",
    description:
      "Create an AI-powered portfolio with lead capture, chat, analytics, and conversion tools in minutes.",
    url: appUrl,
    siteName: "MimicK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MimicK — AI Portfolio Builder",
    description:
      "Create an AI-powered portfolio with lead capture, chat, analytics, and conversion tools in minutes.",
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${instrumentSerif.variable} ${figtree.variable} antialiased`}>
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
