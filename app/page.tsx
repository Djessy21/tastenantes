"use client";

import { useState, useEffect } from "react";
import RestaurantCard from "./components/RestaurantCard";
import CertifiedRestaurantCard from "./components/CertifiedRestaurantCard";
import AdminPanel from "./components/AdminPanel";
import FilterBar from "./components/FilterBar";
import { Restaurant, restaurantService } from "./services/restaurantService";
import certifiedRestaurantService from "./services/certifiedRestaurantService";
import { CertifiedRestaurant } from "./types/restaurant";
import AuthButton from "./components/AuthButton";
import { useSession } from "next-auth/react";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [certifiedRestaurants, setCertifiedRestaurants] = useState<
    CertifiedRestaurant[]
  >([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<
    (Restaurant | CertifiedRestaurant) | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    cuisines: string[];
    establishments: string[];
  }>({
    cuisines: [],
    establishments: [],
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Utiliser la session pour déterminer si l'utilisateur est admin
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    // Fetch restaurants
    fetchRestaurants();
    // Fetch certified restaurants
    fetchCertifiedRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const results = await restaurantService.searchNearby({
        lat: 48.8566,
        lng: 2.3522,
      });
      setRestaurants(results);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
    setLoading(false);
  };

  const fetchCertifiedRestaurants = async () => {
    try {
      const results =
        await certifiedRestaurantService.getCertifiedRestaurants();
      setCertifiedRestaurants(results);
    } catch (error) {
      console.error("Error fetching certified restaurants:", error);
    }
  };

  const handleRestaurantClick = (
    restaurant: Restaurant | CertifiedRestaurant
  ) => {
    setSelectedRestaurant(restaurant);
  };

  const handleToggleFeatured = async (restaurant: CertifiedRestaurant) => {
    try {
      await certifiedRestaurantService.toggleFeatured(restaurant.id.toString());
      fetchCertifiedRestaurants();
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  const handleFilterChange = (newFilters: {
    cuisines: string[];
    establishments: string[];
  }) => {
    setFilters(newFilters);
  };

  // Filtrer les restaurants en fonction des filtres sélectionnés
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Si aucun filtre n'est sélectionné, afficher tous les restaurants
    if (filters.cuisines.length === 0 && filters.establishments.length === 0) {
      return true;
    }

    // Vérifier si le restaurant correspond aux filtres de cuisine
    const matchesCuisine =
      filters.cuisines.length === 0 ||
      filters.cuisines.some((cuisine) =>
        restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())
      );

    // Pour les restaurants normaux, nous n'avons pas d'information sur le type d'établissement
    // Donc on considère qu'ils correspondent toujours au filtre d'établissement
    return matchesCuisine;
  });

  const filteredCertifiedRestaurants = certifiedRestaurants.filter(
    (restaurant) => {
      // Si aucun filtre n'est sélectionné, afficher tous les restaurants
      if (
        filters.cuisines.length === 0 &&
        filters.establishments.length === 0
      ) {
        return true;
      }

      // Vérifier si le restaurant correspond aux filtres de cuisine
      const matchesCuisine =
        filters.cuisines.length === 0 ||
        filters.cuisines.some((cuisine) =>
          restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())
        );

      // Vérifier si le restaurant correspond aux filtres de type d'établissement
      const matchesEstablishment =
        filters.establishments.length === 0 ||
        filters.establishments.some((establishment) =>
          restaurant.specialNote
            ?.toLowerCase()
            .includes(establishment.toLowerCase())
        );

      return matchesCuisine && matchesEstablishment;
    }
  );

  const featuredRestaurants = filteredCertifiedRestaurants.filter(
    (r) => r.featured
  );
  const nonFeaturedCertifiedRestaurants = filteredCertifiedRestaurants.filter(
    (r) => !r.featured
  );

  const handleRestaurantDelete = () => {
    fetchCertifiedRestaurants();
    if (selectedRestaurant) {
      setSelectedRestaurant(null);
    }
  };

  // Listes des types de cuisine et d'établissement
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

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-[50]">
        <div className="dior-container py-4 sm:py-6 flex flex-col items-center gap-6 border-b border-black/10">
          <div className="flex flex-col items-center gap-2 w-full">
            <h1 className="dior-heading text-center text-3xl font-bold">
              Taste Nantes
            </h1>
            <AuthButton />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <FilterBar
              cuisineTypes={cuisineTypes}
              establishmentTypes={establishmentTypes}
              onFilterChange={handleFilterChange}
            />
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="dior-button whitespace-nowrap w-full sm:w-auto"
              >
                + Ajouter
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Espace réservé pour le header */}
      <div className="h-48 sm:h-40 md:h-36"></div>

      <main className="pt-4">
        <div className="dior-container">
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8 dior-text">
                DÉCOUVERTE DE L&apos;EXCELLENCE CULINAIRE...
              </div>
            ) : (
              <>
                {featuredRestaurants.length > 0 && (
                  <div className="space-y-6">
                    {featuredRestaurants.map((restaurant) => (
                      <CertifiedRestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => handleRestaurantClick(restaurant)}
                        isSelected={selectedRestaurant?.id === restaurant.id}
                        onToggleFeatured={() =>
                          handleToggleFeatured(restaurant)
                        }
                        onDelete={handleRestaurantDelete}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}

                {nonFeaturedCertifiedRestaurants.length > 0 && (
                  <div className="space-y-6">
                    {nonFeaturedCertifiedRestaurants.map((restaurant) => (
                      <CertifiedRestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => handleRestaurantClick(restaurant)}
                        isSelected={selectedRestaurant?.id === restaurant.id}
                        onToggleFeatured={() =>
                          handleToggleFeatured(restaurant)
                        }
                        onDelete={handleRestaurantDelete}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}

                {filteredRestaurants.length > 0 && (
                  <div className="space-y-6">
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => handleRestaurantClick(restaurant)}
                        isSelected={selectedRestaurant?.id === restaurant.id}
                      />
                    ))}
                  </div>
                )}

                {filteredRestaurants.length === 0 &&
                  filteredCertifiedRestaurants.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Aucun établissement n&apos;a été trouvé
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </main>

      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onRestaurantAdded={fetchCertifiedRestaurants}
      />
    </div>
  );
}
