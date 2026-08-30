import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}