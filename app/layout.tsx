import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { initDB } from "./lib/db-edge";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Initialiser la base de données au démarrage
initDB().catch(console.error);

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
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
