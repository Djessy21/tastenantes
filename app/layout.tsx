import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { initialize } from "./lib/init";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Initialiser la base de données au démarrage
initialize().catch(console.error);

export const metadata: Metadata = {
  title: "Taste Nantes",
  description: "Découvrez les meilleurs restaurants de Nantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
