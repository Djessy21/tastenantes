"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Footer() {
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Vérifier si nous sommes en environnement de développement
    // En développement, window.location.hostname est généralement 'localhost' ou '127.0.0.1'
    const hostname = window.location.hostname;
    setIsDevelopment(hostname === "localhost" || hostname === "127.0.0.1");
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 shadow-lg z-40 py-2 border-t border-beige-medium">
      <div className="dior-container flex flex-col sm:flex-row justify-between items-center text-xs text-brown-medium">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <Link
            href="/about"
            className="text-brown-dark hover:text-brown-darker transition-colors"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className="text-brown-dark hover:text-brown-darker transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="text-brown-dark hover:text-brown-darker transition-colors"
          >
            Confidentialité
          </Link>
          {isDevelopment && (
            <Link
              href="/accent-demo"
              className="text-brown-dark hover:text-brown-darker transition-colors"
            >
              Démo Couleurs
            </Link>
          )}
        </div>
        <div className="flex items-center">
          <span>© {new Date().getFullYear()} Taste Nantes</span>
        </div>
      </div>
    </footer>
  );
}
