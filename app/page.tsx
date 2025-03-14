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
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { isPreview, currentEnvironment } from "./lib/env";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [certifiedRestaurants, setCertifiedRestaurants] = useState<
    CertifiedRestaurant[]
  >([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<
    (Restaurant | CertifiedRestaurant) | null
  >(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    cuisines: string[];
    establishments: string[];
  }>({
    cuisines: [],
    establishments: [],
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Hooks pour l'infinite scroll
  const {
    page: regularPage,
    loading: regularLoading,
    setLoading: setRegularLoading,
    hasMore: regularHasMore,
    setHasMore: setRegularHasMore,
    lastElementRef: regularLastElementRef,
    reset: resetRegularScroll,
  } = useInfiniteScroll();

  const {
    page: certifiedPage,
    loading: certifiedLoading,
    setLoading: setCertifiedLoading,
    hasMore: certifiedHasMore,
    setHasMore: setCertifiedHasMore,
    lastElementRef: certifiedLastElementRef,
    reset: resetCertifiedScroll,
  } = useInfiniteScroll();

  // Utiliser la session pour déterminer si l'utilisateur est admin
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    // Fetch initial data
    fetchInitialData();
  }, []);

  // Charger plus de restaurants quand la page change
  useEffect(() => {
    if (regularPage > 1) {
      fetchMoreRestaurants();
    }
  }, [regularPage]);

  // Charger plus de restaurants certifiés quand la page change
  useEffect(() => {
    if (certifiedPage > 1) {
      fetchMoreCertifiedRestaurants();
    }
  }, [certifiedPage]);

  // Réinitialiser le scroll infini quand les filtres changent
  useEffect(() => {
    resetRegularScroll();
    resetCertifiedScroll();
    fetchInitialData();
  }, [filters]);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    try {
      await Promise.all([fetchRestaurants(1), fetchCertifiedRestaurants(1)]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRestaurants = async (page = 1) => {
    setRegularLoading(true);
    try {
      const results = await restaurantService.searchNearby({
        lat: 48.8566,
        lng: 2.3522,
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (page === 1) {
        setRestaurants(results);
      } else {
        setRestaurants((prev) => [...prev, ...results]);
      }

      setRegularHasMore(results.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setRegularLoading(false);
    }
  };

  const fetchMoreRestaurants = () => {
    if (!regularLoading && regularHasMore) {
      fetchRestaurants(regularPage);
    }
  };

  const fetchCertifiedRestaurants = async (page = 1) => {
    setCertifiedLoading(true);
    try {
      const results = await certifiedRestaurantService.getCertifiedRestaurants({
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (page === 1) {
        setCertifiedRestaurants(results);
      } else {
        setCertifiedRestaurants((prev) => [...prev, ...results]);
      }

      setCertifiedHasMore(results.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching certified restaurants:", error);
    } finally {
      setCertifiedLoading(false);
    }
  };

  const fetchMoreCertifiedRestaurants = () => {
    if (!certifiedLoading && certifiedHasMore) {
      fetchCertifiedRestaurants(certifiedPage);
    }
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

  const handleRestaurantClick = (
    restaurant: Restaurant | CertifiedRestaurant
  ) => {
    setSelectedRestaurant(restaurant);
  };

  const handleToggleFeatured = async (restaurant: CertifiedRestaurant) => {
    try {
      await certifiedRestaurantService.toggleFeatured(restaurant.id.toString());
      // Recharger les restaurants certifiés
      resetCertifiedScroll();
      fetchCertifiedRestaurants(1);
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

  const handleRestaurantDelete = () => {
    // Rafraîchir la liste des restaurants certifiés
    resetCertifiedScroll();
    fetchCertifiedRestaurants(1);
    // Désélectionner le restaurant
    setSelectedRestaurant(null);
  };

  const handleRestaurantUpdate = (updatedRestaurant: CertifiedRestaurant) => {
    // Mettre à jour la liste des restaurants certifiés
    setCertifiedRestaurants((prevRestaurants) =>
      prevRestaurants.map((restaurant) =>
        restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
      )
    );

    // Si le restaurant mis à jour est sélectionné, mettre à jour la sélection
    if (selectedRestaurant?.id === updatedRestaurant.id) {
      setSelectedRestaurant(updatedRestaurant);
    }
  };

  const runMigration = async () => {
    try {
      const response = await fetch("/api/migrate");
      if (!response.ok) {
        throw new Error("Erreur lors de la migration");
      }
      const data = await response.json();
      alert(data.message || "Migration réussie");
      // Rafraîchir la liste des restaurants
      resetCertifiedScroll();
      fetchCertifiedRestaurants(1);
    } catch (error) {
      console.error("Erreur lors de la migration:", error);
      alert(
        "Erreur lors de la migration. Consultez la console pour plus de détails."
      );
    }
  };

  const seedTestRestaurants = async () => {
    try {
      const response = await fetch("/api/seed");
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout des restaurants de test");
      }
      const data = await response.json();
      alert(data.message || "Restaurants de test ajoutés avec succès");
      // Rafraîchir la liste des restaurants
      resetCertifiedScroll();
      fetchCertifiedRestaurants(1);
    } catch (error) {
      console.error("Erreur lors de l'ajout des restaurants de test:", error);
      alert(
        "Erreur lors de l'ajout des restaurants de test. Consultez la console pour plus de détails."
      );
    }
  };

  const resetPreviewDatabase = async () => {
    if (!isPreview()) {
      alert("Cette action n'est autorisée que dans l'environnement de preview");
      return;
    }

    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser la base de données de preview ? Toutes les données seront supprimées."
      )
    ) {
      try {
        const response = await fetch("/api/reset-preview-db", {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Échec de la réinitialisation");
        }

        const data = await response.json();
        alert(data.message);

        // Rafraîchir les données
        resetCertifiedScroll();
        resetRegularScroll();
        fetchInitialData();
      } catch (error) {
        console.error("Erreur lors de la réinitialisation:", error);
        alert("Erreur lors de la réinitialisation de la base de données");
      }
    }
  };

  const clearAllRestaurants = async () => {
    if (
      confirm(
        "⚠️ ATTENTION: Vous êtes sur le point de supprimer TOUS les restaurants et leurs plats associés. Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?"
      )
    ) {
      try {
        const response = await fetch("/api/restaurants/clear", {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || errorData.message || "Échec de la suppression"
          );
        }

        const data = await response.json();
        alert(`✅ ${data.count} restaurants ont été supprimés avec succès.`);

        // Rafraîchir les données
        resetCertifiedScroll();
        resetRegularScroll();
        fetchInitialData();
      } catch (error) {
        console.error("Erreur lors de la suppression des restaurants:", error);
        alert(
          `❌ Erreur: ${
            error instanceof Error ? error.message : "Erreur inconnue"
          }`
        );
      }
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
          <div className="flex justify-between items-center w-full">
            <div className="flex-1"></div> {/* Espace à gauche */}
            <h1 className="dior-heading text-center text-3xl font-bold flex-1">
              Taste Nantes
              {currentEnvironment !== "production" && (
                <span
                  className={`ml-2 text-xs ${
                    currentEnvironment === "preview"
                      ? "bg-blue-600"
                      : "bg-green-600"
                  } text-white px-2 py-1 rounded-full uppercase`}
                >
                  {currentEnvironment}
                </span>
              )}
            </h1>
            <div className="flex-1 flex justify-end">
              <AuthButton />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <FilterBar
              cuisineTypes={cuisineTypes}
              establishmentTypes={establishmentTypes}
              onFilterChange={handleFilterChange}
            />
            {isAdmin && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="dior-button whitespace-nowrap w-full sm:w-auto"
                >
                  + Ajouter
                </button>
                <button
                  onClick={runMigration}
                  className="dior-button whitespace-nowrap w-full sm:w-auto bg-gray-700 hover:bg-gray-800"
                  title="Ajouter les colonnes website et instagram à la base de données"
                >
                  Migrer DB
                </button>
                <button
                  onClick={seedTestRestaurants}
                  className="dior-button whitespace-nowrap w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  title="Ajouter des restaurants de test pour l'infinite scroll"
                >
                  Ajouter 30 restaurants
                </button>
                {isPreview() && (
                  <button
                    onClick={resetPreviewDatabase}
                    className="dior-button whitespace-nowrap w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    title="Réinitialiser la base de données de preview"
                  >
                    Réinitialiser DB
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={clearAllRestaurants}
                    className="dior-button whitespace-nowrap w-full sm:w-auto bg-red-800 hover:bg-red-900"
                    title="Supprimer tous les restaurants et leurs plats associés"
                  >
                    Supprimer tout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Espace réservé pour le header */}
      <div className="h-48 sm:h-40 md:h-36"></div>

      <main className="pt-4">
        <div className="dior-container">
          <div className="space-y-6">
            {initialLoading ? (
              <div className="text-center py-8 dior-text">
                DÉCOUVERTE DE L&apos;EXCELLENCE CULINAIRE...
              </div>
            ) : (
              <>
                {featuredRestaurants.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">
                      Restaurants en vedette
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
                        onDelete={handleRestaurantDelete}
                        onUpdate={handleRestaurantUpdate}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}

                {nonFeaturedCertifiedRestaurants.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">
                      Restaurants certifiés
                    </h2>
                    {nonFeaturedCertifiedRestaurants.map(
                      (restaurant, index) => (
                        <div
                          key={restaurant.id}
                          ref={
                            index === nonFeaturedCertifiedRestaurants.length - 1
                              ? certifiedLastElementRef
                              : null
                          }
                        >
                          <CertifiedRestaurantCard
                            restaurant={restaurant}
                            onClick={() => handleRestaurantClick(restaurant)}
                            isSelected={
                              selectedRestaurant?.id === restaurant.id
                            }
                            onToggleFeatured={() =>
                              handleToggleFeatured(restaurant)
                            }
                            onDelete={handleRestaurantDelete}
                            onUpdate={handleRestaurantUpdate}
                            isAdmin={isAdmin}
                          />
                        </div>
                      )
                    )}
                    {certifiedLoading && (
                      <div className="text-center py-4">
                        <div className="dior-text">CHARGEMENT...</div>
                      </div>
                    )}
                  </div>
                )}

                {filteredRestaurants.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">
                      Autres restaurants à proximité
                    </h2>
                    {filteredRestaurants.map((restaurant, index) => (
                      <div
                        key={restaurant.id}
                        ref={
                          index === filteredRestaurants.length - 1
                            ? regularLastElementRef
                            : null
                        }
                      >
                        <RestaurantCard
                          restaurant={restaurant}
                          onClick={() => handleRestaurantClick(restaurant)}
                          isSelected={selectedRestaurant?.id === restaurant.id}
                        />
                      </div>
                    ))}
                    {regularLoading && (
                      <div className="text-center py-4">
                        <div className="dior-text">CHARGEMENT...</div>
                      </div>
                    )}
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
        onRestaurantAdded={(restaurant) => {
          resetCertifiedScroll();
          fetchCertifiedRestaurants(1);
        }}
      />
    </div>
  );
}
