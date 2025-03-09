"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoCreditProps {
  credit: string;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  theme?: "light" | "dark";
  size?: "small" | "medium" | "large";
}

export default function PhotoCredit({
  credit,
  position = "bottom-right",
  theme = "dark",
  size = "small",
}: PhotoCreditProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!credit) return null;

  // Déterminer si le crédit est un compte Instagram
  const isInstagram =
    credit.startsWith("@") || (!credit.includes(" ") && !credit.includes("."));
  const formattedCredit = isInstagram
    ? credit.startsWith("@")
      ? credit
      : `@${credit}`
    : credit;

  // Déterminer les classes de position
  const positionClasses = {
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
  };

  // Déterminer les classes de taille
  const sizeClasses = {
    small: "text-xs py-1 px-2",
    medium: "text-sm py-1.5 px-3",
    large: "text-base py-2 px-4",
  };

  // Déterminer les classes de thème
  const themeClasses = {
    light: "bg-white/80 text-gray-800 hover:bg-white",
    dark: "bg-black/60 text-white hover:bg-black/80",
  };

  // Ouvrir le lien Instagram si c'est un compte Instagram
  const handleClick = () => {
    if (isInstagram) {
      const username = formattedCredit.startsWith("@")
        ? formattedCredit.substring(1)
        : formattedCredit;
      window.open(
        `https://instagram.com/${username}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} z-10 ${
        isInstagram ? "cursor-pointer" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isInstagram ? handleClick : undefined}
      initial={{ opacity: 0.7 }}
      whileHover={{ opacity: 1, scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`
          ${themeClasses[theme]} 
          ${sizeClasses[size]} 
          backdrop-blur-sm 
          rounded-full 
          font-medium 
          tracking-wide 
          shadow-md 
          transition-all 
          duration-300
          flex 
          items-center 
          gap-1.5
        `}
      >
        {isInstagram && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={
              size === "small"
                ? "w-3 h-3"
                : size === "medium"
                ? "w-3.5 h-3.5"
                : "w-4 h-4"
            }
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        )}
        <span>{formattedCredit}</span>

        <AnimatePresence>
          {isInstagram && isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={
                  size === "small"
                    ? "w-3 h-3"
                    : size === "medium"
                    ? "w-3.5 h-3.5"
                    : "w-4 h-4"
                }
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
