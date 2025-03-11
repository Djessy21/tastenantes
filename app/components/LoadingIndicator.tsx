"use client";

import { motion } from "framer-motion";

interface LoadingIndicatorProps {
  size?: "small" | "medium" | "large";
  text?: string;
}

export default function LoadingIndicator({
  size = "medium",
  text = "Chargement",
}: LoadingIndicatorProps) {
  // Définir les tailles en fonction du paramètre size
  const sizes = {
    small: {
      container: "py-2",
      dot: "h-1.5 w-1.5",
      text: "text-xs",
    },
    medium: {
      container: "py-4",
      dot: "h-2 w-2",
      text: "text-sm",
    },
    large: {
      container: "py-6",
      dot: "h-3 w-3",
      text: "text-base",
    },
  };

  const currentSize = sizes[size];

  // Animation des points
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -5 },
  };

  return (
    <div className={`flex flex-col items-center ${currentSize.container}`}>
      <div className="flex items-center justify-center space-x-2 mb-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${currentSize.dot} bg-black rounded-full`}
            initial="initial"
            animate="animate"
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.5,
              delay: i * 0.15,
            }}
            variants={dotVariants}
          />
        ))}
      </div>
      {text && (
        <p
          className={`${currentSize.text} text-gray-600 uppercase tracking-wider`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
