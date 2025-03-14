"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | null;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Montage côté client uniquement pour éviter les erreurs d'hydratation
  useEffect(() => {
    setIsMounted(true);

    // Détecter si on est sur mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Vérifier au chargement
    checkIfMobile();

    // Vérifier au redimensionnement
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Fermer le modal quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    // Empêcher le défilement du body quand le modal est ouvert
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay avec flou */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Contenu du modal */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative z-[1000] w-full overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-[#E8E1D9]/60"
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(107, 93, 79, 0.15), 0 8px 10px -6px rgba(107, 93, 79, 0.1)",
              backgroundImage:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(253, 251, 249, 0.95))",
              margin: isMobile ? "0 16px" : "0 auto",
              maxWidth: isMobile ? "calc(100% - 32px)" : "28rem",
              maxHeight: isMobile
                ? "calc(100vh - 64px)"
                : "calc(100vh - 120px)",
              overflowY: "auto",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* En-tête du modal */}
            {title && (
              <div className="px-6 py-4 border-b border-[#E8E1D9]/60">
                <h3
                  id="modal-title"
                  className="text-xl font-semibold text-[#5D4D40]"
                >
                  {title}
                </h3>
              </div>
            )}

            {/* Corps du modal */}
            <div className={`p-${isMobile ? "4" : "6"}`}>{children}</div>

            {/* Bouton de fermeture */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-[#8C7B6B] hover:text-[#5D4D40] hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8E1D9]"
              aria-label="Fermer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
