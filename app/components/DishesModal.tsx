"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dish } from "../lib/db-edge";
import PhotoCredit from "./PhotoCredit";

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
  const [currentIndex, setCurrentIndex] = useState(0);

  // Charger les plats quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadDishes();
    }
  }, [isOpen, restaurantId]);

  // Empêcher le défilement du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Navigation avec les flèches du clavier
  useEffect(() => {
    function handleArrowKeys(event: KeyboardEvent) {
      if (!isOpen || dishes.length === 0) return;

      if (event.key === "ArrowLeft") {
        goToPrevious();
      } else if (event.key === "ArrowRight") {
        goToNext();
      }
    }

    document.addEventListener("keydown", handleArrowKeys);
    return () => {
      document.removeEventListener("keydown", handleArrowKeys);
    };
  }, [isOpen, dishes, currentIndex]);

  // Fonction pour charger les plats
  const loadDishes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/dishes`);
      if (!response.ok) throw new Error("Impossible de charger les plats");

      const data = await response.json();
      setDishes(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Erreur lors du chargement des plats:", error);
      setError("Une erreur est survenue lors du chargement des plats");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour aller au plat suivant
  const goToNext = () => {
    if (dishes.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % dishes.length);
  };

  // Fonction pour aller au plat précédent
  const goToPrevious = () => {
    if (dishes.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + dishes.length) % dishes.length
    );
  };

  // Fonction pour formater le prix en toute sécurité
  const formatPrice = (price: any): string => {
    if (typeof price === "number") {
      return price.toFixed(2);
    } else if (typeof price === "string") {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
    }
    return "0.00";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay avec effet de flou */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Contenu du carousel - Design moderne et responsive */}
      <div
        className="relative z-10 w-full max-w-md px-4 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec titre du restaurant et bouton de fermeture */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {restaurantName}
          </h2>

          {/* Bouton de fermeture - Design amélioré */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all duration-300 backdrop-blur-sm shadow-lg transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-black/20 backdrop-blur-sm rounded-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent mb-3"></div>
            <p className="text-white/90 text-sm font-medium">
              Chargement des plats...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4 bg-black/20 backdrop-blur-sm rounded-xl text-white flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mb-3 text-red-400"
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
            <p className="font-medium">{error}</p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-10 px-4 bg-black/20 backdrop-blur-sm rounded-xl text-white flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mb-3 text-gray-400"
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
            <p className="font-medium">
              Aucun plat disponible pour ce restaurant
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Carousel - Design moderne */}
            <div className="relative w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col"
                >
                  {/* Image du plat avec compteur et boutons de navigation */}
                  <div className="relative w-full aspect-square bg-black/20 rounded-xl overflow-hidden mb-4 shadow-lg">
                    {dishes[currentIndex].image_url ? (
                      <div className="relative w-full h-full">
                        <img
                          src={dishes[currentIndex].image_url}
                          alt={dishes[currentIndex].name}
                          className="w-full h-full object-cover"
                        />
                        {dishes[currentIndex].photo_credit && (
                          <div className="absolute bottom-2 right-2">
                            <PhotoCredit
                              credit={dishes[currentIndex].photo_credit || ""}
                              position="bottom-right"
                              theme="dark"
                              size="small"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
                        <span className="text-sm font-medium">
                          Pas d'image disponible
                        </span>
                      </div>
                    )}

                    {/* Compteur de plats - En bas de l'image */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white font-medium">
                      {currentIndex + 1} / {dishes.length}
                    </div>

                    {/* Boutons de navigation - Écartés davantage sur les côtés */}
                    <div className="absolute inset-y-0 -left-4 -right-4 flex items-center justify-between pointer-events-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToPrevious();
                        }}
                        className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white/80 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 hover:-translate-x-1 focus:outline-none focus:ring-2 focus:ring-white/30"
                        aria-label="Plat précédent"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToNext();
                        }}
                        className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white/80 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-white/30"
                        aria-label="Plat suivant"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Informations du plat - Carte avec fond semi-transparent */}
                  <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 text-white shadow-lg">
                    <h3 className="text-xl font-bold mb-2 tracking-tight">
                      {dishes[currentIndex].name}
                    </h3>

                    {/* Prix mis en évidence */}
                    <div className="inline-block bg-white/20 rounded-lg px-3 py-1 mb-3">
                      <p className="text-lg font-semibold">
                        {formatPrice(dishes[currentIndex].price)} €
                      </p>
                    </div>

                    {dishes[currentIndex].description && (
                      <p className="text-sm text-white/90 leading-relaxed">
                        {dishes[currentIndex].description}
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Indicateurs de position - Style moderne */}
              <div className="flex justify-center mt-4 gap-1.5">
                {dishes.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-white w-4"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Voir le plat ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
