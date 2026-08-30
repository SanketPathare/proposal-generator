import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProposalGen — The Modern Proposal Platform for Independent Professionals",
  description: "Create, customize, share, and track high-converting proposals. Built with a sleek, modern aesthetic for freelancers, consultants, and agencies.",
  keywords: ["proposal generator", "freelance proposals", "business proposal", "client management", "contra style", "proposal templates"],
  authors: [{ name: "ProposalGen" }],
  openGraph: {
    title: "ProposalGen — Modern Proposals for Independent Creators",
    description: "Create, customize, share, and track high-converting proposals in minutes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fcfcfd] text-[#09090b] selection:bg-[#d4ff00] selection:text-black font-sans antialiased">
        {children}
      </body>
    </html>
  );
}