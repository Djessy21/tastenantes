import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { initDB } from "./lib/db-edge";
import Providers from "./providers";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";

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
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <main className="flex-grow">{children}</main>
          <ScrollToTop />
          <Footer />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
