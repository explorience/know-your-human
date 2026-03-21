import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Know Your Human — KYC for the Celo Ecosystem",
  description:
    "The first identity verification API for AI agents and dApps on Celo. Verify once, credential lives on-chain, anyone checks it for free.",
  openGraph: {
    title: "Know Your Human",
    description: "KYC as a service for agents, dApps, and developers on Celo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0a] text-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
