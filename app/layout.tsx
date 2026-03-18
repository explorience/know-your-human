import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent KYC Gateway — Privacy-Preserving Identity for AI Agents",
  description:
    "ZK-SNARK based KYC verification for AI agents on Celo. Powered by Self Protocol and x402 micropayments.",
  openGraph: {
    title: "Agent KYC Gateway",
    description: "Privacy-preserving KYC for AI agents on Celo",
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
