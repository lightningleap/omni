import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "SiteNav - AI Lead Capture Chatbot",
    template: "%s | SiteNav",
  },
  description: "Convert website visitors into qualified leads with AI-powered chatbot. No code required. Setup in 5 minutes.",
  keywords: ["AI chatbot", "lead capture", "lead generation", "website chatbot", "conversational AI", "sales automation"],
  authors: [{ name: "SiteNav" }],
  openGraph: {
    title: "SiteNav - AI Lead Capture Chatbot",
    description: "Convert website visitors into qualified leads with AI-powered chatbot. No code required.",
    type: "website",
    siteName: "SiteNav",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteNav - AI Lead Capture Chatbot",
    description: "Convert website visitors into qualified leads with AI-powered chatbot. No code required.",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
