import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Proposal Generator - Create Professional Proposals. Your Way.",
  description: "A simple SaaS platform for freelancers and independent professionals to create, customize, and manage professional proposals.",
  keywords: ["proposal", "freelancer", "business", "client", "template", "generator"],
  authors: [{ name: "Proposal Generator" }],
  openGraph: {
    title: "Proposal Generator - Create Professional Proposals. Your Way.",
    description: "A simple SaaS platform for freelancers and independent professionals to create, customize, and manage professional proposals.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}