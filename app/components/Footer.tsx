"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 shadow-lg z-40 py-2 border-t border-gray-200">
      <div className="dior-container flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <Link href="/about" className="hover:text-black transition-colors">
            À propos
          </Link>
          <Link href="/contact" className="hover:text-black transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-black transition-colors">
            Confidentialité
          </Link>
        </div>
        <div className="flex items-center">
          <span>© {new Date().getFullYear()} Taste Nantes</span>
        </div>
      </div>
    </footer>
  );
}
