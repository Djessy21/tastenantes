"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dish } from "../lib/db-edge";

interface DishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
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
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
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
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Contenu du modal */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 25,
          }}
          className="relative z-10 w-full max-w-5xl mx-4 overflow-hidden bg-white rounded-2xl shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dishes-modal-title"
        >
          {/* En-tête du modal */}
          <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h3
                id="dishes-modal-title"
                className="text-2xl font-semibold text-gray-900"
              >
                Les plats de {restaurantName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Découvrez notre sélection de plats savoureux
              </p>
            </div>

            {/* Bouton de fermeture */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Fermer"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Corps du modal */}
          <div className="p-8">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-gray-500">Chargement des plats...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Aucun plat disponible pour ce restaurant
              </div>
            ) : (
              <div className="relative">
                {/* Bouton de défilement gauche */}
                {dishes.length > 3 && (
                  <motion.button
                    onClick={scrollLeft}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Voir les plats précédents"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-700"
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
                  </motion.button>
                )}

                {/* Conteneur de défilement horizontal */}
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto gap-8 py-6 px-4 snap-x snap-mandatory hide-scrollbar"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {dishes.map((dish, index) => (
                    <motion.div
                      key={dish.id}
                      className="flex-shrink-0 w-80 snap-start bg-white rounded-xl shadow-md overflow-hidden dish-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.1, duration: 0.4 },
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                      onClick={() => setSelectedDish(dish)}
                    >
                      {dish.image_url ? (
                        <div className="h-52 w-full relative overflow-hidden">
                          <img
                            src={dish.image_url}
                            alt={dish.name}
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="h-52 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}

                      <div className="p-5">
                        <h4 className="text-xl font-medium mb-2 text-gray-900">
                          {dish.name}
                        </h4>
                        {dish.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {dish.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold text-gray-900">
                            {parseFloat(String(dish.price)).toFixed(2)} €
                          </p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {new Date(dish.created_at).toLocaleDateString(
                              "fr-FR",
                              {
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
                {dishes.length > 3 && (
                  <motion.button
                    onClick={scrollRight}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Voir les plats suivants"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-700"
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
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal détaillé pour un plat sélectionné */}
        <AnimatePresence>
          {selectedDish && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60"
                onClick={() => setSelectedDish(null)}
                aria-hidden="true"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="fixed z-70 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <button
                  onClick={() => setSelectedDish(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors z-10"
                  aria-label="Fermer"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="flex flex-col md:flex-row">
                  {selectedDish.image_url ? (
                    <div className="w-full md:w-1/2 h-64 md:h-auto">
                      <img
                        src={selectedDish.image_url}
                        alt={selectedDish.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="w-full md:w-1/2 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedDish.name}
                    </h3>

                    <div className="flex items-center mb-4">
                      <span className="text-xl font-bold text-gray-900 mr-3">
                        {parseFloat(String(selectedDish.price)).toFixed(2)} €
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {new Date(selectedDish.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {selectedDish.description && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Description
                        </h4>
                        <p className="text-gray-600">
                          {selectedDish.description}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto">
                      <button
                        onClick={() => setSelectedDish(null)}
                        className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Retour aux plats
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
