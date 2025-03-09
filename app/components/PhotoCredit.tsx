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
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
  };

  // Déterminer les classes de taille
  const sizeClasses = {
    small: "text-xs py-1 px-2",
    medium: "text-sm py-1.5 px-3",
    large: "text-base py-2 px-4",
  };

  // Déterminer les classes de thème
  const themeClasses = {
    dark: "text-white bg-black/70",
    light: "text-white bg-black/70",
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
    <div
      className={`absolute ${positionClasses[position]} ${themeClasses[theme]} ${sizeClasses[size]} z-10 px-3 py-1`}
    >
      {isInstagram ? (
        <a
          href={`https://instagram.com/${formattedCredit.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-white"
        >
          <span className="opacity-90">Crédit photo : </span>
          {formattedCredit}
        </a>
      ) : (
        <span className="font-medium text-white">
          <span className="opacity-90">Crédit photo : </span>
          {formattedCredit}
        </span>
      )}
    </div>
  );
}
