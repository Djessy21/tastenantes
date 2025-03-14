"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 shadow-lg z-40 py-2 border-t border-[#E8E1D9]">
      <div className="dior-container flex flex-col sm:flex-row justify-between items-center text-xs text-[#8C7B6B]">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <Link
            href="/about"
            className="hover:text-[#5D4D40] transition-colors"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#5D4D40] transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="hover:text-[#5D4D40] transition-colors"
          >
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
