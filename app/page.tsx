"use client";

import { useState, useEffect, useRef } from "react";
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
import LoadingIndicator from "./components/LoadingIndicator";
import ScrollStatus from "./components/ScrollStatus";
import DishesModal from "./components/DishesModal";

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
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);

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

  // Effet pour ajouter scroll-padding-top à l'élément html
  useEffect(() => {
    // S'assurer que le code s'exécute uniquement côté client
    if (typeof document === "undefined") return;

    // Calculer la hauteur du header en fonction de l'état des filtres
    const updateScrollPadding = () => {
      const headerHeight =
        isMobile && !showFiltersOnMobile
          ? 70 // Hauteur approximative du header sans filtres sur mobile
          : 150; // Hauteur approximative du header avec filtres

      // Appliquer scroll-padding-top à l'élément html
      document.documentElement.style.scrollPaddingTop = `${headerHeight}px`;
    };

    // Appliquer immédiatement
    updateScrollPadding();

    // Mettre à jour lorsque l'état des filtres change
    window.addEventListener("resize", updateScrollPadding);

    return () => {
      window.removeEventListener("resize", updateScrollPadding);
    };
  }, [isMobile, showFiltersOnMobile]);

  // Mesurer la hauteur réelle du header
  useEffect(() => {
    // S'assurer que le code s'exécute uniquement côté client
    if (typeof window === "undefined") return;

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Observer les changements de taille du header
    const resizeObserver = new ResizeObserver(updateHeaderHeight);

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    // Mettre à jour également lors du redimensionnement de la fenêtre
    window.addEventListener("resize", updateHeaderHeight);

    // Mettre à jour lorsque l'état des filtres change
    updateHeaderHeight();

    return () => {
      if (headerRef.current) {
        resizeObserver.unobserve(headerRef.current);
      }
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [isMobile, showFiltersOnMobile]);

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
    // Si aucun filtre n'est sélectionné et pas de recherche, afficher tous les restaurants
    if (
      filters.cuisines.length === 0 &&
      filters.establishments.length === 0 &&
      !searchQuery
    ) {
      return true;
    }

    // Vérifier si le restaurant correspond à la recherche par nom
    const matchesSearch =
      !searchQuery ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Vérifier si le restaurant correspond aux filtres de cuisine
    const matchesCuisine =
      filters.cuisines.length === 0 ||
      filters.cuisines.some((cuisine) =>
        restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())
      );

    // Pour les restaurants normaux, nous n'avons pas d'information sur le type d'établissement
    // Donc on considère qu'ils correspondent toujours au filtre d'établissement
    return matchesCuisine && matchesSearch;
  });

  const filteredCertifiedRestaurants = certifiedRestaurants.filter(
    (restaurant) => {
      // Si aucun filtre n'est sélectionné et pas de recherche, afficher tous les restaurants
      if (
        filters.cuisines.length === 0 &&
        filters.establishments.length === 0 &&
        !searchQuery
      ) {
        return true;
      }

      // Vérifier si le restaurant correspond à la recherche par nom
      const matchesSearch =
        !searchQuery ||
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());

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

      return matchesCuisine && matchesEstablishment && matchesSearch;
    }
  );

  const handleRestaurantClick = (
    restaurant: Restaurant | CertifiedRestaurant
  ) => {
    setSelectedRestaurant(restaurant);
    setIsDishesModalOpen(true);
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

  const handleSearchChange = (searchTerm: string) => {
    setSearchQuery(searchTerm);
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
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
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
    <div className="min-h-screen bg-white pb-16">
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 bg-white shadow-md z-[50]"
      >
        <div className="dior-container py-4 sm:py-6 flex flex-col items-center gap-6 border-b border-black/10">
          <div className="flex justify-between items-center w-full">
            <div className="flex-1">
              {isMobile && (
                <button
                  onClick={() => setShowFiltersOnMobile(!showFiltersOnMobile)}
                  className={`p-2 rounded-lg transition-colors relative ${
                    filters.cuisines.length > 0 ||
                    filters.establishments.length > 0 ||
                    searchQuery
                      ? "bg-[#6B5D4F] text-white"
                      : "bg-[#F5F2EE] hover:bg-[#E8E1D9] text-[#6B5D4F]"
                  }`}
                  aria-label={
                    showFiltersOnMobile
                      ? "Masquer les filtres"
                      : "Afficher les filtres"
                  }
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
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {(filters.cuisines.length > 0 ||
                    filters.establishments.length > 0 ||
                    searchQuery) &&
                    !showFiltersOnMobile && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                    )}
                </button>
              )}
            </div>
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
          <div
            className={`w-full transition-all duration-300 ease-in-out overflow-hidden ${
              isMobile && !showFiltersOnMobile
                ? "max-h-0 opacity-0 my-0"
                : "max-h-96 opacity-100"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <FilterBar
                cuisineTypes={cuisineTypes}
                establishmentTypes={establishmentTypes}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
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
        </div>
      </header>

      {/* Spacer dynamique qui prend exactement la hauteur du header */}
      <div
        style={{ height: `${headerHeight + 24}px` }}
        className="transition-all duration-300 ease-in-out"
      ></div>

      <main className="pb-12">
        <div className="dior-container">
          <div className="space-y-8">
            {initialLoading ? (
              <div className="text-center py-8">
                <LoadingIndicator
                  size="large"
                  text="DÉCOUVERTE DE L'EXCELLENCE CULINAIRE"
                />
              </div>
            ) : (
              <>
                {filteredCertifiedRestaurants.length > 0 && (
                  <div className="space-y-8">
                    {filteredCertifiedRestaurants.map((restaurant, index) => (
                      <div
                        key={restaurant.id}
                        ref={
                          index === filteredCertifiedRestaurants.length - 1
                            ? certifiedLastElementRef
                            : null
                        }
                        className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden restaurant-card-animation restaurant-card-hover"
                        style={{
                          borderRadius: isMobile
                            ? "0 0 0.5rem 0"
                            : "0 0.5rem 0.5rem 0",
                          borderTopRightRadius: isMobile ? "0" : "0.5rem",
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <CertifiedRestaurantCard
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
                      </div>
                    ))}
                    {certifiedLoading && (
                      <div className="text-center py-4">
                        <LoadingIndicator size="small" />
                      </div>
                    )}
                    <ScrollStatus
                      currentCount={filteredCertifiedRestaurants.length}
                      hasMore={certifiedHasMore}
                      loading={certifiedLoading}
                    />
                  </div>
                )}

                {filteredRestaurants.length > 0 && (
                  <div className="space-y-8">
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
                        className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden restaurant-card-animation restaurant-card-hover"
                        style={{
                          borderRadius: isMobile
                            ? "0 0 0.5rem 0"
                            : "0 0.5rem 0.5rem 0",
                          borderTopRightRadius: isMobile ? "0" : "0.5rem",
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                          animationDelay: `${index * 0.1}s`,
                        }}
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
                        <LoadingIndicator size="small" />
                      </div>
                    )}
                    <ScrollStatus
                      currentCount={filteredRestaurants.length}
                      hasMore={regularHasMore}
                      loading={regularLoading}
                    />
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

      {/* Modal pour afficher les plats */}
      {selectedRestaurant && (
        <DishesModal
          isOpen={isDishesModalOpen}
          onClose={() => setIsDishesModalOpen(false)}
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
        />
      )}
    </div>
  );
}
