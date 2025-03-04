"use client";

import { useState, useEffect } from "react";
import RestaurantCard from "./components/RestaurantCard";
import CertifiedRestaurantCard from "./components/CertifiedRestaurantCard";
import AdminPanel from "./components/AdminPanel";
import { Restaurant, restaurantService } from "./services/restaurantService";
import certifiedRestaurantService, {
  type CertifiedRestaurant,
} from "./services/certifiedRestaurantService";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
      await certifiedRestaurantService.toggleFeatured(restaurant.id);
      fetchCertifiedRestaurants();
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCertifiedRestaurants = certifiedRestaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredRestaurants = filteredCertifiedRestaurants.filter(
    (r) => r.featured
  );
  const nonFeaturedCertifiedRestaurants = filteredCertifiedRestaurants.filter(
    (r) => !r.featured
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="dior-container py-4 sm:py-6 flex flex-col items-center gap-6 border-b border-black/10">
          <div className="flex flex-col items-center gap-2 w-full">
            <h1 className="dior-heading text-center text-3xl font-bold">
              Taste Nantes
            </h1>
            <button
              onClick={toggleAdmin}
              className="text-xs uppercase tracking-wider px-3 py-1 border border-black/20 hover:border-black transition-colors"
            >
              {isAdmin ? "Mode Admin" : "Mode Client"}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <input
              type="text"
              placeholder="RECHERCHER DES RESTAURANTS"
              className="dior-input w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

      <main className="pt-28 sm:pt-24">
        <div className="dior-container">
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8 dior-text">
                DÉCOUVERTE DE L'EXCELLENCE CULINAIRE...
              </div>
            ) : (
              <>
                {featuredRestaurants.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="dior-text text-lg uppercase tracking-wider">
                      Restaurants Recommandés
                    </h2>
                    {featuredRestaurants.map((restaurant) => (
                      <CertifiedRestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => handleRestaurantClick(restaurant)}
                        isSelected={selectedRestaurant?.id === restaurant.id}
                        onToggleFeatured={() =>
                          handleToggleFeatured(restaurant)
                        }
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}

                {nonFeaturedCertifiedRestaurants.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="dior-text text-lg uppercase tracking-wider">
                      Restaurants Certifiés
                    </h2>
                    {nonFeaturedCertifiedRestaurants.map((restaurant) => (
                      <CertifiedRestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => handleRestaurantClick(restaurant)}
                        isSelected={selectedRestaurant?.id === restaurant.id}
                        onToggleFeatured={() =>
                          handleToggleFeatured(restaurant)
                        }
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}

                {filteredRestaurants.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="dior-text text-lg uppercase tracking-wider">
                      Autres Restaurants
                    </h2>
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
                    <div className="text-center py-8 dior-text">
                      AUCUN ÉTABLISSEMENT TROUVÉ
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
