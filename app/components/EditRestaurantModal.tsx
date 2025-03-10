"use client";

import { useState, useEffect } from "react";
import { CertifiedRestaurant } from "../types/restaurant";
import ImageUpload from "./ImageUpload";
import { motion, AnimatePresence } from "framer-motion";

interface EditRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: CertifiedRestaurant;
  onRestaurantUpdated: (restaurant: CertifiedRestaurant) => void;
}

export default function EditRestaurantModal({
  isOpen,
  onClose,
  restaurant,
  onRestaurantUpdated,
}: EditRestaurantModalProps) {
  // Liste des types de cuisine les plus répandus
  const cuisineTypes = [
    "Française",
    "Italienne",
    "Japonaise",
    "Chinoise",
    "Indienne",
    "Mexicaine",
    "Libanaise",
    "Thaïlandaise",
    "Américaine",
    "Espagnole",
    "Grecque",
    "Marocaine",
    "Vietnamienne",
    "Coréenne",
    "Brésilienne",
    "Végétarienne",
    "Végane",
    "Fruits de mer",
    "Fusion",
    "Autre",
  ];

  // Liste des types d'établissements
  const establishmentTypes = [
    "Restaurant",
    "Pizzeria",
    "Coffee Shop",
    "Burger",
    "Fast Food",
    "Bistro",
    "Brasserie",
    "Trattoria",
    "Pub",
    "Bar à vin",
    "Crêperie",
    "Salon de thé",
    "Food Truck",
    "Boulangerie",
    "Chocolaterie",
    "Autre",
  ];

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    cuisine: "Française",
    specialNote: "",
    certifiedBy: "",
    featured: false,
    website: "",
    instagram: "",
    photo_credit: "",
    location: {
      lat: 0,
      lng: 0,
    },
    tempImageUrl: "",
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le formulaire avec les données du restaurant
  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        address: restaurant.address,
        cuisine: restaurant.cuisine,
        specialNote: restaurant.specialNote || "",
        certifiedBy: restaurant.certifiedBy,
        featured: restaurant.featured,
        website: restaurant.website || "",
        instagram: restaurant.instagram || "",
        photo_credit: restaurant.photo_credit || "",
        location: restaurant.location || { lat: 0, lng: 0 },
        tempImageUrl: restaurant.image || "",
      });

      // Initialiser l'aperçu de l'image avec l'image actuelle du restaurant
      if (restaurant.image) {
        setImagePreview(restaurant.image);
      }
    }
  }, [restaurant]);

  const handleImageChange = (file: File | null) => {
    setNewImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let updatedImageUrl = formData.tempImageUrl || restaurant.image;

      // Si une nouvelle image a été sélectionnée, la télécharger
      if (newImage) {
        console.log(
          "Téléchargement d'une nouvelle image pour le restaurant:",
          restaurant.id
        );
        const imageFormData = new FormData();
        imageFormData.append("image", newImage);
        imageFormData.append("type", "restaurant");

        const imageResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const responseData = await imageResponse.json();
          updatedImageUrl = responseData.imageUrl;
          console.log("Nouvelle URL d'image obtenue:", updatedImageUrl);
        } else {
          const errorText = await imageResponse.text();
          console.error("Erreur lors de l'upload de l'image:", errorText);
          setError("Erreur lors de l'upload de l'image");
          setIsSubmitting(false);
          return;
        }
      } else {
        console.log("Utilisation de l'URL d'image existante:", updatedImageUrl);
      }

      // Mettre à jour le restaurant
      console.log("Mise à jour du restaurant avec les données:", {
        name: formData.name,
        address: formData.address,
        cuisine: formData.cuisine,
        specialNote: formData.specialNote,
        certifiedBy: formData.certifiedBy,
        featured: formData.featured,
        website: formData.website,
        instagram: formData.instagram,
        photo_credit: formData.photo_credit,
        image: updatedImageUrl,
        location: formData.location,
      });

      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          cuisine: formData.cuisine,
          specialNote: formData.specialNote,
          certifiedBy: formData.certifiedBy,
          featured: formData.featured,
          website: formData.website,
          instagram: formData.instagram,
          photo_credit: formData.photo_credit,
          image: updatedImageUrl,
          location: formData.location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur de réponse API:", errorData);
        throw new Error(
          errorData.error || "Erreur lors de la mise à jour du restaurant"
        );
      }

      const updatedRestaurant = await response.json();
      console.log("Restaurant mis à jour avec succès:", updatedRestaurant);
      onRestaurantUpdated(updatedRestaurant);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du restaurant:", error);
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 25,
          }}
          className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Modifier le restaurant</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image du restaurant */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Image du restaurant
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        <span>Aucune image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <ImageUpload
                      onImageSelect={(imageUrl) => {
                        console.log(
                          "Image sélectionnée dans ImageUpload:",
                          imageUrl
                        );
                        // Si c'est une URL de données, convertir en File
                        if (imageUrl.startsWith("data:")) {
                          console.log("Conversion de l'URL de données en File");
                          fetch(imageUrl)
                            .then((res) => res.blob())
                            .then((blob) => {
                              const file = new File(
                                [blob],
                                "restaurant-image.jpg",
                                { type: "image/jpeg" }
                              );
                              console.log(
                                "File créé à partir de l'URL de données"
                              );
                              handleImageChange(file);
                            })
                            .catch((err) =>
                              console.error(
                                "Erreur lors de la conversion de l'URL de données:",
                                err
                              )
                            );
                        } else if (
                          imageUrl.startsWith("/api/") ||
                          imageUrl.startsWith("/uploads/")
                        ) {
                          // Si c'est une URL d'API ou d'uploads, mettre à jour directement l'URL de l'image
                          console.log(
                            "URL d'image reçue, mise à jour de l'aperçu:",
                            imageUrl
                          );
                          setImagePreview(imageUrl);
                          // Stocker l'URL dans un état local pour l'utiliser lors de la soumission
                          setFormData((prev) => ({
                            ...prev,
                            tempImageUrl: imageUrl, // Nous utiliserons cette URL temporaire lors de la soumission
                          }));
                        }
                      }}
                      onCreditSelect={(credit) => {
                        console.log("Crédit photo mis à jour:", credit);
                        setFormData({ ...formData, photo_credit: credit });
                      }}
                      initialCredit={formData.photo_credit}
                      imageType="restaurant"
                    />
                  </div>
                </div>
              </div>

              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du restaurant
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de cuisine
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      value={formData.cuisine}
                      onChange={(e) =>
                        setFormData({ ...formData, cuisine: e.target.value })
                      }
                    >
                      {cuisineTypes.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type d'établissement
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      value={formData.specialNote}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialNote: e.target.value,
                        })
                      }
                    >
                      {establishmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Web
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optionnel - URL complète avec http:// ou https://
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="nomdurestaurant"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Optionnel - Nom d'utilisateur sans le @
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validé par
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="compte_instagram_validateur"
                      value={formData.certifiedBy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          certifiedBy: e.target.value,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Compte Instagram du validateur (sans le @)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    id="featured"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="featured"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Mettre en vedette ce restaurant
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
