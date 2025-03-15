"use client";

import React from "react";
import { motion } from "framer-motion";

interface AccentButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: "solid" | "outline" | "light";
  size?: "sm" | "md" | "lg";
}

const AccentButton: React.FC<AccentButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  icon,
  variant = "solid",
  size = "md",
}) => {
  // Définir les classes de base en fonction de la variante
  let baseClasses =
    "font-medium transition-all duration-300 flex items-center justify-center";

  // Ajouter les classes de taille
  const sizeClasses = {
    sm: "text-xs py-1.5 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-2.5 px-5",
  };

  // Ajouter les classes de variante
  const variantClasses = {
    solid: "bg-[#7D9D74] text-white hover:bg-[#5C7A53]",
    outline:
      "bg-transparent border border-[#7D9D74] text-[#7D9D74] hover:bg-[#E1EBD9]",
    light: "bg-[#E1EBD9] text-[#5C7A53] hover:bg-[#A3BF9B] hover:text-white",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const allClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} rounded-md ${className}`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={allClasses}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default AccentButton;
