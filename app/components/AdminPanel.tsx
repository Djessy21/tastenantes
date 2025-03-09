import { useState } from "react";
import certifiedRestaurantService from "../services/certifiedRestaurantService";
import { CertifiedRestaurant } from "../types/restaurant";
import AuthGuard from "./AuthGuard";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded: (restaurant: CertifiedRestaurant) => void;
}

interface DishForm {
  name: string;
  description: string;
  price: string;
  image?: File;
}

export default function AdminPanel({
  isOpen,
  onClose,
  onRestaurantAdded,
}: AdminPanelProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    cuisine: "Française",
    establishmentType: "Restaurant",
    certifiedBy: "",
    certificationDate: new Date().toISOString(),
    featured: false,
    website: "",
    instagram: "",
    photo_credit: "",
    location: {
      lat: 0,
      lng: 0,
    },
  });

  const [dishes, setDishes] = useState<DishForm[]>([]);
  const [restaurantImages, setRestaurantImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

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
    "Autre",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setRestaurantImages((prev) => [...prev, ...files]);
  };

  const handleDishImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setDishes((prev) => {
        const newDishes = [...prev];
        newDishes[index] = { ...newDishes[index], image: file };
        return newDishes;
      });
    }
  };

  const addDish = () => {
    setDishes((prev) => [...prev, { name: "", description: "", price: "0" }]);
  };

  const removeDish = (index: number) => {
    setDishes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDish = (
    index: number,
    field: keyof DishForm,
    value: string | number
  ) => {
    setDishes((prev) => {
      const newDishes = [...prev];
      if (field === "price") {
        const numValue = typeof value === "string" ? value : value.toString();
        if (numValue === "" || !isNaN(parseFloat(numValue))) {
          newDishes[index] = { ...newDishes[index], [field]: numValue };
        }
      } else {
        newDishes[index] = { ...newDishes[index], [field]: value };
      }
      return newDishes;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let restaurantImageUrl = "";

      // Télécharger l'image principale du restaurant si elle existe
      if (restaurantImages.length > 0) {
        console.log(
          `AdminPanel: ${restaurantImages.length} images sélectionnées, index principal: ${mainImageIndex}`
        );
        console.log(
          `AdminPanel: Type de l'image principale:`,
          restaurantImages[mainImageIndex].type
        );
        console.log(
          `AdminPanel: Taille de l'image principale: ${restaurantImages[mainImageIndex].size} bytes`
        );

        // Télécharger l'image principale du restaurant si elle existe
        const mainImage = restaurantImages[mainImageIndex];
        const imageFormData = new FormData();
        imageFormData.append("image", mainImage);
        imageFormData.append("type", "restaurant");

        console.log(
          "AdminPanel: Envoi de l'image du restaurant à l'API d'upload"
        );
        const imageResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        console.log(
          `AdminPanel: Statut de la réponse: ${imageResponse.status}`
        );

        if (imageResponse.ok) {
          const responseData = await imageResponse.json();
          console.log(`AdminPanel: Données de réponse:`, responseData);
          restaurantImageUrl = responseData.imageUrl;
          console.log(
            `AdminPanel: Image du restaurant uploadée avec succès: ${restaurantImageUrl}`
          );
        } else {
          const errorText = await imageResponse.text();
          console.error(
            "AdminPanel: Erreur lors de l'upload de l'image du restaurant:",
            errorText
          );
          restaurantImageUrl = `/default-restaurant.svg`;
        }
      } else {
        console.log(
          "AdminPanel: Aucune image sélectionnée, utilisation de l'image par défaut"
        );
        restaurantImageUrl = `/default-restaurant.svg`;
      }

      // Créer le restaurant avec l'image
      console.log(
        `AdminPanel: Création du restaurant avec l'image: ${restaurantImageUrl}`
      );
      const restaurant =
        await certifiedRestaurantService.addCertifiedRestaurant({
          name: formData.name,
          address: formData.address,
          location: formData.location,
          cuisine: formData.cuisine,
          certifiedBy: formData.certifiedBy,
          certificationDate: formData.certificationDate,
          featured: formData.featured,
          rating: 5,
          image_url: restaurantImageUrl,
          specialNote: formData.establishmentType,
          website: formData.website,
          instagram: formData.instagram,
          photo_credit: formData.photo_credit,
        });

      // Ajouter les plats
      if (dishes.length > 0) {
        for (const dish of dishes) {
          let dishImageUrl = "";

          if (dish.image) {
            // Créer un FormData pour l'upload d'image
            const formData = new FormData();
            formData.append("image", dish.image);
            formData.append("type", "dish");

            console.log(
              `Envoi de l'image du plat ${dish.name} à l'API d'upload`
            );
            // Upload de l'image
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const { imageUrl } = await response.json();
              dishImageUrl = imageUrl;
              console.log(
                `Image du plat uploadée avec succès: ${dishImageUrl}`
              );
            } else {
              console.error(
                `Erreur lors de l'upload de l'image du plat ${dish.name}:`,
                await response.text()
              );
              dishImageUrl = `/default-dish.svg`;
            }
          } else {
            dishImageUrl = `/default-dish.svg`;
          }

          // Créer le plat avec l'URL de l'image
          console.log(
            `Création du plat ${dish.name} avec l'image: ${dishImageUrl}`
          );
          await certifiedRestaurantService.addDish(restaurant.id.toString(), {
            name: dish.name,
            description: dish.description,
            price: parseFloat(dish.price),
            image_url: dishImageUrl,
          });
        }
      }

      onRestaurantAdded(restaurant);

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        address: "",
        cuisine: "Française",
        establishmentType: "Restaurant",
        certifiedBy: "",
        certificationDate: new Date().toISOString(),
        featured: false,
        website: "",
        instagram: "",
        photo_credit: "",
        location: {
          lat: 0,
          lng: 0,
        },
      });
      setDishes([]);
      setRestaurantImages([]);
      setMainImageIndex(0);

      // Fermer la fenêtre
      onClose();
    } catch (error) {
      console.error("Error adding restaurant:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AuthGuard requiredRole="admin">
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="dior-text text-xl uppercase tracking-wider">
              Ajouter un Restaurant Certifié
            </h2>
            <button
              onClick={onClose}
              className="text-black/50 hover:text-black transition-colors"
              type="button"
            >
              <svg
                className="w-6 h-6"
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base du restaurant */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider font-medium">
                Informations Générales
              </h3>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Nom du Restaurant
                </label>
                <input
                  type="text"
                  required
                  className="dior-input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  required
                  className="dior-input"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Type de Cuisine
                </label>
                <select
                  required
                  className="dior-input"
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
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Type d'Établissement
                </label>
                <select
                  required
                  className="dior-input"
                  value={formData.establishmentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      establishmentType: e.target.value,
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

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Site Web
                </label>
                <input
                  type="url"
                  className="dior-input"
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
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    className="dior-input pl-7"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    className="dior-input"
                    value={formData.location.lat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          lat: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    className="dior-input"
                    value={formData.location.lng}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          lng: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Validé par
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    className="dior-input pl-7"
                    placeholder="compte_instagram_validateur"
                    value={formData.certifiedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, certifiedBy: e.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Compte Instagram du validateur (sans le @)
                </p>
              </div>
            </div>

            {/* Images du restaurant */}
            <div className="space-y-6">
              <h3 className="text-sm uppercase tracking-wider font-medium">
                Images du Restaurant
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">
                    Images
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {restaurantImages.map((image, index) => (
                      <div
                        key={index}
                        className={`relative w-24 h-24 border rounded-lg overflow-hidden ${
                          index === mainImageIndex
                            ? "ring-2 ring-black"
                            : "hover:ring-2 hover:ring-gray-300"
                        }`}
                        onClick={() => setMainImageIndex(index)}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Restaurant image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === mainImageIndex && (
                          <div className="absolute top-1 right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}

                    <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
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
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cliquez sur une image pour la définir comme principale
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">
                    Crédit photo
                  </label>
                  <input
                    type="text"
                    className="dior-input"
                    placeholder="@photographe ou Nom du photographe"
                    value={formData.photo_credit}
                    onChange={(e) =>
                      setFormData({ ...formData, photo_credit: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Compte Instagram (avec @) ou nom du photographe
                  </p>
                </div>
              </div>
            </div>

            {/* Plats */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm uppercase tracking-wider font-medium">
                  Plats
                </h3>
                <button
                  type="button"
                  onClick={addDish}
                  className="text-xs uppercase tracking-wider px-3 py-1 border border-black hover:bg-black hover:text-white transition-colors"
                >
                  + Ajouter un Plat
                </button>
              </div>

              {dishes.map((dish, index) => (
                <div
                  key={index}
                  className="border border-black/10 p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Plat #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeDish(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1">
                      Nom du Plat
                    </label>
                    <input
                      type="text"
                      required
                      className="dior-input"
                      value={dish.name}
                      onChange={(e) =>
                        updateDish(index, "name", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      className="dior-input min-h-[80px] resize-none"
                      value={dish.description}
                      onChange={(e) =>
                        updateDish(index, "description", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1">
                      Prix
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="dior-input"
                      value={dish.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || !isNaN(parseFloat(value))) {
                          updateDish(index, "price", value);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1">
                      Image du Plat
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleDishImageUpload(index, e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        aria-label="Sélectionner une image pour le plat"
                      />
                      <button
                        type="button"
                        className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-black/80 transition-colors"
                        onClick={() => {}} // Ce bouton ne fait rien, l'input au-dessus capte le clic
                      >
                        Sélectionner une image
                      </button>
                    </div>
                    {dish.image && (
                      <img
                        src={URL.createObjectURL(dish.image)}
                        alt={dish.name}
                        className="mt-2 w-full max-w-[200px] aspect-square object-cover"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-colors"
                style={{ borderRadius: "var(--button-border-radius)" }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white hover:bg-black/90 transition-colors"
                style={{ borderRadius: "var(--button-border-radius)" }}
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
