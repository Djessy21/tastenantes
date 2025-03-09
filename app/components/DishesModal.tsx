"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dish } from "../lib/db-edge";

interface DishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number;
  restaurantName: string;
}

export default function DishesModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
}: DishesModalProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Charger les plats quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadDishes();
    }
  }, [isOpen, restaurantId]);

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

  // Fonction pour charger les plats
  const loadDishes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/dishes`);
      if (!response.ok) throw new Error("Impossible de charger les plats");

      const data = await response.json();
      setDishes(data);
    } catch (error) {
      console.error("Erreur lors du chargement des plats:", error);
      setError("Une erreur est survenue lors du chargement des plats");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour faire défiler vers la gauche
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // Fonction pour faire défiler vers la droite
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay avec flou */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
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
          className="relative z-10 w-full max-w-4xl mx-4 overflow-hidden bg-white rounded-xl shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dishes-modal-title"
        >
          {/* En-tête du modal */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3
              id="dishes-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              Les plats de {restaurantName}
            </h3>

            {/* Bouton de fermeture */}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
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
          </div>

          {/* Corps du modal */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun plat disponible pour ce restaurant
              </div>
            ) : (
              <div className="relative">
                {/* Bouton de défilement gauche */}
                {dishes.length > 2 && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                    aria-label="Voir les plats précédents"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Conteneur de défilement horizontal */}
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto gap-6 py-4 px-2 snap-x snap-mandatory hide-scrollbar"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {dishes.map((dish) => (
                    <motion.div
                      key={dish.id}
                      className="flex-shrink-0 w-72 snap-start bg-white rounded-lg shadow-md overflow-hidden dish-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      {dish.image_url ? (
                        <div className="h-48 w-full">
                          <img
                            src={dish.image_url}
                            alt={dish.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <span>Pas d'image</span>
                        </div>
                      )}

                      <div className="p-4">
                        <h4 className="text-lg font-medium mb-2">
                          {dish.name}
                        </h4>
                        {dish.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {dish.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold text-black">
                            {parseFloat(String(dish.price)).toFixed(2)} €
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(dish.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bouton de défilement droit */}
                {dishes.length > 2 && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                    aria-label="Voir les plats suivants"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
