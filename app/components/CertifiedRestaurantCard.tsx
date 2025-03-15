"use client";

import { useState, useEffect } from "react";
import { Dish } from "../lib/db-edge";
import AddDishForm from "./AddDishForm";
import { CertifiedRestaurant } from "../types/restaurant";
import { motion } from "framer-motion";
import EditRestaurantModal from "./EditRestaurantModal";
import PhotoCredit from "./PhotoCredit";
import { getUncachedImageUrl, clearImageCache } from "@/app/lib/utils";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dishesCount, setDishesCount] = useState<number>(0);
  const [dishesLoaded, setDishesLoaded] = useState<boolean>(false);
  const [imageKey, setImageKey] = useState<string>(
    `restaurant-image-${restaurant.id}`
  );

  // Précharger les informations sur les plats en arrière-plan
  useEffect(() => {
    const loadDishesInfo = async () => {
      try {
        const response = await fetch(
          `/api/restaurants/${restaurant.id}/dishes`
        );
        if (!response.ok) throw new Error("Impossible de charger les plats");

        const data = await response.json();
        setDishesCount(data.length);
        setDishesLoaded(true);
      } catch (error) {
        console.error("Erreur lors du chargement des plats:", error);
        setDishesCount(0);
        setDishesLoaded(true);
      }
    };

    loadDishesInfo();
  }, [restaurant.id]);

  // Mettre à jour le nombre de plats après l'ajout d'un plat
  useEffect(() => {
    if (showAddDishForm === false && dishesLoaded) {
      // Recharger les informations sur les plats quand le formulaire d'ajout est fermé
      const reloadDishesInfo = async () => {
        try {
          const response = await fetch(
            `/api/restaurants/${restaurant.id}/dishes`
          );
          if (!response.ok) throw new Error("Impossible de charger les plats");

          const data = await response.json();
          setDishesCount(data.length);
        } catch (error) {
          console.error("Erreur lors du rechargement des plats:", error);
        }
      };

      reloadDishesInfo();
    }
  }, [showAddDishForm, dishesLoaded, restaurant.id]);

  // Mettre à jour la clé de l'image lorsque le restaurant change
  useEffect(() => {
    // Générer une nouvelle clé pour forcer le rechargement de l'image uniquement si l'URL de l'image a changé
    if (restaurant.image) {
      // Précharger l'image pour accélérer l'affichage
      const img = new Image();
      img.src = restaurant.image;

      // Ne générer une nouvelle clé que si l'URL de l'image a changé
      setImageKey(
        `restaurant-image-${restaurant.id}-${restaurant.image.split("?")[0]}`
      );
      console.log(
        "Nouvelle clé d'image générée:",
        `restaurant-image-${restaurant.id}-${restaurant.image.split("?")[0]}`
      );
    }
  }, [restaurant.id, restaurant.image]);

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
    // Incrémenter le nombre de plats
    setDishesCount((prevCount) => prevCount + 1);
  };

  const openEditModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleRestaurantUpdated = (updatedRestaurant: CertifiedRestaurant) => {
    console.log("Restaurant mis à jour:", updatedRestaurant);
    console.log("Ancienne image:", restaurant.image);
    console.log("Nouvelle image:", updatedRestaurant.image);

    // Si l'image a changé, utiliser getUncachedImageUrl pour forcer le rechargement
    if (
      updatedRestaurant.image &&
      updatedRestaurant.image !== restaurant.image
    ) {
      updatedRestaurant.image = getUncachedImageUrl(
        updatedRestaurant.image,
        true
      );
      console.log(
        "URL d'image avec timestamp pour forcer le rechargement:",
        updatedRestaurant.image
      );

      // Générer une nouvelle clé pour forcer le rechargement de l'image
      const newKey = `restaurant-image-${updatedRestaurant.id}-${Date.now()}`;
      console.log("Nouvelle clé d'image générée:", newKey);
      setImageKey(newKey);

      // Forcer le nettoyage du cache de l'image
      clearImageCache(updatedRestaurant.image);
      console.log("Cache de l'image nettoyé:", updatedRestaurant.image);
    }

    // Appeler le callback de mise à jour
    onUpdate?.(updatedRestaurant);
    setIsEditModalOpen(false);
  };

  // Fonction pour ouvrir un lien externe sans déclencher l'événement onClick du parent
  const openExternalLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Rendu du bouton de plats en fonction du nombre de plats
  const renderDishesButton = () => {
    if (dishesCount > 0) {
      return (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
          className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-all duration-300 shadow-sm hover:shadow-md relative"
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
          <span>Voir les plats testés</span>
          <span className="absolute -top-2 -right-2 bg-white border border-accent text-accent-dark text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
            {dishesCount}
          </span>
        </motion.button>
      );
    } else if (isAdmin) {
      // Pour les admins, afficher un bouton pour ajouter des plats si aucun plat n'existe
      return (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddDishForm(!showAddDishForm);
          }}
          className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300 rounded-md"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Ajouter un plat
        </motion.button>
      );
    } else {
      // Pour les utilisateurs normaux, ne pas afficher de bouton si aucun plat n'existe
      return null;
    }
  };

  return (
    <>
      <div
        className={`dior-card p-0 transition-all duration-300 relative rounded-lg ${
          isSelected
            ? "shadow-[0_10px_30px_rgba(107,93,79,0.2)] border border-beige-medium"
            : "shadow-[0_5px_15px_rgba(107,93,79,0.1)] hover:shadow-[0_15px_35px_rgba(107,93,79,0.15)]"
        }`}
        onClick={onClick}
      >
        <div className="relative z-20">
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {/* Suppression de l'indicateur d'étoile pour les restaurants en vedette */}
          </div>

          <div className="flex flex-col sm:flex-row">
            {/* Photo à gauche - prend tout l'espace vertical */}
            <div className="w-full sm:w-1/3 restaurant-image-container relative">
              {restaurant.image ? (
                <>
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="restaurant-image"
                    key={imageKey}
                    loading="eager"
                    decoding="sync"
                    onLoad={() =>
                      console.log("Image chargée:", restaurant.image)
                    }
                    onError={(e) => {
                      console.error(
                        `Erreur de chargement de l'image: ${restaurant.image}`
                      );
                      // Remplacer par l'image par défaut
                      e.currentTarget.src = "/default-restaurant.svg";
                      // Masquer le crédit photo si on utilise l'image par défaut
                      const creditElement =
                        e.currentTarget.parentElement?.querySelector(
                          ".photo-credit"
                        ) as HTMLElement | null;
                      if (creditElement) {
                        creditElement.style.display = "none";
                      }
                    }}
                  />
                  {restaurant.photo_credit && (
                    <PhotoCredit
                      credit={restaurant.photo_credit}
                      position="bottom-right"
                      theme="dark"
                      size="small"
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center border border-beige-medium bg-beige-light text-brown-medium">
                  <span className="text-lg opacity-50">Photo</span>
                </div>
              )}
            </div>

            {/* Informations à droite - avec meilleure organisation */}
            <div className="w-full sm:w-2/3 flex flex-col justify-between p-4 sm:p-6">
              <div>
                {/* En-tête avec nom */}
                <div className="mb-3">
                  <h3 className="text-xl font-medium mb-2 text-brown-darker">
                    {restaurant.name}
                  </h3>

                  {/* Type d'établissement et cuisine avec badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-lighter text-accent-dark">
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

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige-light text-brown-dark">
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
                      className="h-4 w-4 mr-1 mt-0.5 text-accent"
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
                    <span className="text-brown-darker">
                      {restaurant.address}
                    </span>
                  </div>

                  {/* Site web avec icône */}
                  {restaurant.website && (
                    <div className="flex items-start text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 mt-0.5 text-accent"
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
                        className="text-brown-darker hover:text-accent transition-colors flex items-center group"
                        onClick={(e) =>
                          openExternalLink(e, restaurant.website || "#")
                        }
                      >
                        <span className="group-hover:underline">
                          {restaurant.website?.replace(
                            /^https?:\/\/(www\.)?/,
                            ""
                          )}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 ml-1 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Instagram avec icône */}
                  {restaurant.instagram && (
                    <div className="flex items-start text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 mt-0.5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="5"
                          ry="5"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="12" r="3.5" strokeWidth="2" />
                        <circle cx="17.5" cy="6.5" r=".75" strokeWidth="2" />
                      </svg>
                      <button
                        className="text-brown-darker hover:text-accent transition-colors flex items-center group"
                        onClick={(e) =>
                          openExternalLink(
                            e,
                            `https://instagram.com/${restaurant.instagram}`
                          )
                        }
                      >
                        <span className="group-hover:underline">
                          @{restaurant.instagram}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 ml-1 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions et certification */}
              <div className="mt-auto">
                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Bouton pour voir/ajouter des plats */}
                  {renderDishesButton()}

                  {isAdmin && (
                    <>
                      <motion.button
                        onClick={openEditModal}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300 rounded-md"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Modifier
                      </motion.button>

                      {dishesCount === 0 ? null : (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddDishForm(!showAddDishForm);
                          }}
                          className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300 rounded-md"
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          {showAddDishForm ? "Annuler" : "Ajouter un plat"}
                        </motion.button>
                      )}

                      <motion.button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                        whileHover={{ scale: isDeleting ? 1 : 1.03 }}
                        whileTap={{ scale: isDeleting ? 1 : 0.97 }}
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
                <div className="text-xs flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1 text-accent"
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
                  <span className="text-brown-darker">Testé par</span>{" "}
                  <button
                    className="ml-1 text-brown-darker hover:text-accent hover:underline transition-colors"
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
              className="mt-6 border-t border-beige-medium pt-6 px-4 sm:px-6 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-sm uppercase tracking-wider font-medium mb-4 text-accent">
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
