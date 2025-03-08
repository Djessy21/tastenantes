import { useState } from "react";
import certifiedRestaurantService from "../services/certifiedRestaurantService";
import { CertifiedRestaurant } from "../types/restaurant";

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
        const mainImage = restaurantImages[mainImageIndex];
        const imageFormData = new FormData();
        imageFormData.append("image", mainImage);
        imageFormData.append("type", "restaurant");

        const imageResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const { imageUrl } = await imageResponse.json();
          restaurantImageUrl = imageUrl;
        }
      }

      // Créer le restaurant avec l'image
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
        });

      // Ajouter les plats
      if (dishes.length > 0) {
        for (const dish of dishes) {
          if (dish.image) {
            // Créer un FormData pour l'upload d'image
            const formData = new FormData();
            formData.append("image", dish.image);
            formData.append("type", "dish");

            // Upload de l'image
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            const { imageUrl } = await response.json();

            // Créer le plat avec l'URL de l'image
            await certifiedRestaurantService.addDish(restaurant.id.toString(), {
              name: dish.name,
              description: dish.description,
              price: parseFloat(dish.price),
              image_url: imageUrl,
            });
          } else {
            // Créer le plat sans image
            await certifiedRestaurantService.addDish(restaurant.id.toString(), {
              name: dish.name,
              description: dish.description,
              price: parseFloat(dish.price),
              image_url: "",
            });
          }
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
          </div>

          {/* Images du restaurant */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider font-medium">
              Images du Restaurant
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-1">
                Ajouter des Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/80"
              />
            </div>

            {restaurantImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {restaurantImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Restaurant ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setMainImageIndex(index)}
                      className={`absolute inset-0 flex items-center justify-center text-xs uppercase ${
                        index === mainImageIndex
                          ? "bg-black/50 text-white"
                          : "bg-transparent hover:bg-black/30 hover:text-white"
                      }`}
                    >
                      {index === mainImageIndex
                        ? "Image Principale"
                        : "Définir comme Principale"}
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              <div key={index} className="border border-black/10 p-4 space-y-4">
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
                    onChange={(e) => updateDish(index, "name", e.target.value)}
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDishImageUpload(index, e)}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/80"
                  />
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
  );
}
