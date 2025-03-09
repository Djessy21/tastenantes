"use client";

import { useState } from "react";
import { Dish } from "../lib/db-edge";
import AddDishForm from "./AddDishForm";
import DishesModal from "./DishesModal";
import { CertifiedRestaurant } from "../types/restaurant";
import { motion } from "framer-motion";
import EditRestaurantModal from "./EditRestaurantModal";

interface CertifiedRestaurantCardProps {
  restaurant: CertifiedRestaurant;
  onClick?: () => void;
  isSelected?: boolean;
  onToggleFeatured?: () => void;
  onDelete?: () => void;
  onUpdate?: (updatedRestaurant: CertifiedRestaurant) => void;
  isAdmin?: boolean;
}

export default function CertifiedRestaurantCard({
  restaurant,
  onClick,
  isSelected,
  onToggleFeatured,
  onDelete,
  onUpdate,
  isAdmin = false,
}: CertifiedRestaurantCardProps) {
  const [showAddDishForm, setShowAddDishForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce restaurant ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete restaurant");
      }

      onDelete?.();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      alert("Une erreur est survenue lors de la suppression du restaurant");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDishAdded = () => {
    // Fermer le formulaire après l'ajout d'un plat
    setShowAddDishForm(false);
    // Si le modal des plats est ouvert, il se mettra à jour automatiquement
  };

  const openDishesModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDishesModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleRestaurantUpdated = (updatedRestaurant: CertifiedRestaurant) => {
    onUpdate?.(updatedRestaurant);
    setIsEditModalOpen(false);
  };

  // Fonction pour ouvrir un lien externe sans déclencher l'événement onClick du parent
  const openExternalLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        className={`dior-card p-0 transition-all duration-300 relative rounded-lg ${
          isSelected
            ? "shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-gray-200"
            : "shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)]"
        }`}
        onClick={onClick}
      >
        <div className="relative z-20">
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {restaurant.featured && (
              <div
                className="h-3 w-3 text-yellow-500"
                title="Restaurant en vedette"
              >
                ★
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row">
            {/* Photo à gauche - prend tout l'espace vertical */}
            <div className="w-full sm:w-1/3 restaurant-image-container">
              {restaurant.image ? (
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="restaurant-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-400">
                  <span className="text-lg opacity-50">Photo</span>
                </div>
              )}
            </div>

            {/* Informations à droite - avec meilleure organisation */}
            <div className="w-full sm:w-2/3 flex flex-col justify-between p-4 sm:p-6">
              <div>
                {/* En-tête avec nom */}
                <div className="mb-3">
                  <h3 className="text-xl font-medium mb-2">
                    {restaurant.name}
                  </h3>

                  {/* Type d'établissement et cuisine avec badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {restaurant.specialNote || "Restaurant"}
                    </span>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      {restaurant.cuisine}
                    </span>
                  </div>

                  {/* Adresse avec icône */}
                  <div className="flex items-start text-sm mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 mt-0.5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="opacity-75">{restaurant.address}</span>
                  </div>

                  {/* Site web avec icône */}
                  {restaurant.website && (
                    <div className="flex items-start text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 mt-0.5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                        />
                      </svg>
                      <button
                        className="opacity-75 text-blue-600 hover:underline"
                        onClick={(e) =>
                          openExternalLink(e, restaurant.website || "#")
                        }
                      >
                        {restaurant.website?.replace(
                          /^https?:\/\/(www\.)?/,
                          ""
                        )}
                      </button>
                    </div>
                  )}

                  {/* Instagram avec icône */}
                  {restaurant.instagram && (
                    <div className="flex items-start text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 mt-0.5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                      </svg>
                      <button
                        className="opacity-75 text-pink-600 hover:underline"
                        onClick={(e) =>
                          openExternalLink(
                            e,
                            `https://instagram.com/${restaurant.instagram}`
                          )
                        }
                      >
                        @{restaurant.instagram}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions et certification */}
              <div className="mt-auto">
                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <motion.button
                    onClick={openDishesModal}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Voir les plats
                  </motion.button>

                  {isAdmin && (
                    <>
                      <motion.button
                        onClick={openEditModal}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ borderRadius: "var(--button-border-radius)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Modifier
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddDishForm(!showAddDishForm);
                        }}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ borderRadius: "var(--button-border-radius)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        {showAddDishForm ? "Annuler" : "Ajouter un plat"}
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFeatured?.();
                        }}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ borderRadius: "var(--button-border-radius)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                        {restaurant.featured
                          ? "Retirer vedette"
                          : "Mettre en vedette"}
                      </motion.button>

                      <motion.button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isDeleting ? 1 : 1.03 }}
                        whileTap={{ scale: isDeleting ? 1 : 0.97 }}
                        style={{ borderRadius: "var(--button-border-radius)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        {isDeleting ? "Suppression..." : "Supprimer"}
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Certification */}
                <div className="text-xs opacity-50 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Validée par{" "}
                  <button
                    className="ml-1 text-pink-600 hover:underline"
                    onClick={(e) =>
                      restaurant.certifiedBy &&
                      openExternalLink(
                        e,
                        `https://instagram.com/${restaurant.certifiedBy}`
                      )
                    }
                  >
                    @{restaurant.certifiedBy}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showAddDishForm && isAdmin && (
            <div
              className="mt-6 border-t border-gray-200 pt-6 px-4 sm:px-6 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-sm uppercase tracking-wider font-medium mb-4">
                Ajouter un nouveau plat
              </h4>
              <AddDishForm
                restaurantId={restaurant.id}
                onDishAdded={handleDishAdded}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal pour afficher les plats */}
      <DishesModal
        isOpen={isDishesModalOpen}
        onClose={() => setIsDishesModalOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />

      {/* Modal pour éditer le restaurant */}
      <EditRestaurantModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        restaurant={restaurant}
        onRestaurantUpdated={handleRestaurantUpdated}
      />
    </>
  );
}
