"use client";

import { useState } from "react";
import { Dish } from "../lib/db-edge";
import AddDishForm from "./AddDishForm";
import DishesModal from "./DishesModal";
import { CertifiedRestaurant } from "../types/restaurant";

interface CertifiedRestaurantCardProps {
  restaurant: CertifiedRestaurant;
  onClick?: () => void;
  isSelected?: boolean;
  onToggleFeatured?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export default function CertifiedRestaurantCard({
  restaurant,
  onClick,
  isSelected,
  onToggleFeatured,
  onDelete,
  isAdmin = false,
}: CertifiedRestaurantCardProps) {
  const [showAddDishForm, setShowAddDishForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);

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
                </div>
              </div>

              {/* Actions et certification */}
              <div className="mt-auto">
                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={openDishesModal}
                    className="text-xs uppercase tracking-wider px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                    style={{ borderRadius: "var(--button-border-radius)" }}
                  >
                    Voir les plats
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddDishForm(!showAddDishForm);
                        }}
                        className="text-xs uppercase tracking-wider px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                        style={{ borderRadius: "var(--button-border-radius)" }}
                      >
                        {showAddDishForm ? "Annuler" : "Ajouter un plat"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFeatured?.();
                        }}
                        className="text-xs uppercase tracking-wider px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                        style={{ borderRadius: "var(--button-border-radius)" }}
                      >
                        {restaurant.featured
                          ? "Retirer vedette"
                          : "Mettre en vedette"}
                      </button>

                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-xs uppercase tracking-wider px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderRadius: "var(--button-border-radius)" }}
                      >
                        {isDeleting ? "Suppression..." : "Supprimer"}
                      </button>
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
                  Validée par Taste Nantes
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
    </>
  );
}
