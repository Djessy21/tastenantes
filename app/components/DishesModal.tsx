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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState(0);

  // Référence pour le conteneur du carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  // Seuil minimum pour considérer un swipe (en pixels)
  const minSwipeDistance = 50;

  // Détecter si on est sur mobile
  useEffect(() => {
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

  // Gestionnaires d'événements tactiles pour le swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Réinitialiser touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && dishes.length > 0) {
      goToNext();
    } else if (isRightSwipe && dishes.length > 0) {
      goToPrevious();
    }
  };

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
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % dishes.length);
  };

  // Fonction pour aller au plat précédent
  const goToPrevious = () => {
    if (dishes.length === 0) return;
    setDirection(-1);
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

  // Variants pour les animations
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
        opacity: { duration: 0.2 },
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 20,
        },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { duration: 0.2 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      },
    }),
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Overlay avec effet de flou */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(5px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Contenu du carousel - Design moderne et responsive */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="relative z-10 w-full max-w-md mx-auto"
            style={{
              margin: isMobile ? "0 16px" : "0 auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bannière du restaurant - Nouveau design plus visible */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-[#6B5D4F] text-white px-6 py-4 rounded-t-2xl shadow-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {restaurantName}
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  {dishes.length > 0
                    ? `${dishes.length} plats disponibles`
                    : ""}
                </p>
              </div>

              {/* Bouton de fermeture - Design amélioré */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200 backdrop-blur-sm transform hover:rotate-90 focus:outline-none"
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
            </motion.div>

            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col justify-center items-center h-64 bg-white rounded-b-2xl shadow-2xl"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#E8E1D9] opacity-25"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#6B5D4F] animate-spin"></div>
                </div>
                <p className="text-[#5D4D40] text-sm font-medium mt-4">
                  Chargement des plats...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-center py-10 px-6 bg-white rounded-b-2xl shadow-2xl text-[#5D4D40] flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-400"
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
                </div>
                <p className="font-medium text-lg">{error}</p>
                <button
                  onClick={loadDishes}
                  className="mt-4 px-4 py-2 bg-[#6B5D4F] text-white rounded-lg hover:bg-[#5D4D40] transition-colors"
                >
                  Réessayer
                </button>
              </motion.div>
            ) : dishes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-center py-10 px-6 bg-white rounded-b-2xl shadow-2xl text-[#5D4D40] flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#F5F2EE] flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[#8C7B6B]"
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
                </div>
                <p className="font-medium text-lg">
                  Aucun plat disponible pour ce restaurant
                </p>
              </motion.div>
            ) : (
              <div
                ref={carouselRef}
                className="relative bg-white rounded-b-2xl overflow-hidden shadow-2xl"
              >
                {/* Carousel - Design avec effet de rebond */}
                <div className="relative w-full mx-auto">
                  <AnimatePresence
                    mode="wait"
                    initial={false}
                    custom={direction}
                  >
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col"
                    >
                      {/* Image du plat avec compteur et boutons de navigation */}
                      <div
                        className="relative w-full aspect-square bg-[#F5F2EE] overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {dishes[currentIndex].image_url ? (
                          <img
                            src={dishes[currentIndex].image_url}
                            alt={dishes[currentIndex].name}
                            className="w-full h-full object-cover"
                            draggable="false" // Empêcher le glissement de l'image
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8C7B6B]">
                            <span className="text-sm font-medium">
                              Pas d'image disponible
                            </span>
                          </div>
                        )}

                        {/* Compteur de plats - En bas de l'image */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#6B5D4F]/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white font-medium">
                          {currentIndex + 1} / {dishes.length}
                        </div>

                        {/* Boutons de navigation - Repositionnés pour une meilleure ergonomie */}
                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                          {/* Flèche gauche - Positionnée sur le côté gauche avec un espacement */}
                          <motion.div
                            className="h-full flex items-center pl-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                              }}
                              className="pointer-events-auto bg-[#6B5D4F]/70 hover:bg-[#6B5D4F] backdrop-blur-sm text-white rounded-full p-2 shadow-sm transition-all duration-200 transform hover:scale-110 hover:-translate-x-1 focus:outline-none"
                              aria-label="Plat précédent"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                            </button>
                          </motion.div>

                          {/* Zone centrale transparente pour permettre l'interaction avec l'image */}
                          <div className="flex-grow h-full"></div>

                          {/* Flèche droite - Positionnée sur le côté droit avec un espacement */}
                          <motion.div
                            className="h-full flex items-center pr-2"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                              }}
                              className="pointer-events-auto bg-[#6B5D4F]/70 hover:bg-[#6B5D4F] backdrop-blur-sm text-white rounded-full p-2 shadow-sm transition-all duration-200 transform hover:scale-110 hover:translate-x-1 focus:outline-none"
                              aria-label="Plat suivant"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>
                          </motion.div>
                        </div>
                      </div>

                      {/* Informations du plat - Carte avec fond blanc */}
                      <div className="bg-white p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold tracking-tight text-[#5D4D40] pr-2">
                            {dishes[currentIndex].name}
                          </h3>

                          {/* Prix mis en évidence */}
                          <div className="bg-[#F5F2EE] rounded-lg px-3 py-1 flex-shrink-0">
                            <p className="text-lg font-semibold text-[#6B5D4F]">
                              {formatPrice(dishes[currentIndex].price)} €
                            </p>
                          </div>
                        </div>

                        {dishes[currentIndex].description && (
                          <p className="text-sm text-[#5D4D40]/90 leading-relaxed">
                            {dishes[currentIndex].description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Indicateurs de position - Style moderne */}
                <div className="flex justify-center py-4 gap-1.5">
                  {dishes.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all duration-200 ${
                        index === currentIndex
                          ? "bg-[#6B5D4F] w-6"
                          : "bg-[#6B5D4F]/30 w-2 hover:bg-[#6B5D4F]/50"
                      }`}
                      onClick={() => {
                        setDirection(index > currentIndex ? 1 : -1);
                        setCurrentIndex(index);
                      }}
                      aria-label={`Voir le plat ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
