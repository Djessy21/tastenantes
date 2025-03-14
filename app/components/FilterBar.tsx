import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types de filtres
interface FilterProps {
  cuisineTypes: string[];
  establishmentTypes: string[];
  onFilterChange: (filters: {
    cuisines: string[];
    establishments: string[];
  }) => void;
  onSearchChange?: (searchTerm: string) => void;
}

export default function FilterBar({
  cuisineTypes,
  establishmentTypes,
  onFilterChange,
  onSearchChange,
}: FilterProps) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<
    string[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "cuisine" | "establishment" | "search"
  >("cuisine");
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Détecter si l'appareil est mobile
  useEffect(() => {
    // S'assurer que le code s'exécute uniquement côté client
    if (typeof window === "undefined") return;

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

  // Nombre maximum de filtres à afficher en fonction de la taille de l'écran
  const maxVisibleFilters = isMobile ? 2 : 5;

  // Fermer les suggestions lorsqu'on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        buttonRef.current !== event.target &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Appliquer la recherche en temps réel avec un délai
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(restaurantSearchTerm);
      }
    }, 300); // Délai de 300ms pour éviter trop d'appels pendant la frappe

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [restaurantSearchTerm, onSearchChange]);

  // Ajouter une meta tag pour désactiver le zoom sur mobile
  useEffect(() => {
    // S'assurer que le code s'exécute uniquement côté client
    if (typeof window === "undefined") return;

    // Vérifier si la meta tag existe déjà
    let metaViewport = document.querySelector('meta[name="viewport"]');

    // Si elle n'existe pas, la créer
    if (!metaViewport) {
      metaViewport = document.createElement("meta");
      metaViewport.setAttribute("name", "viewport");
      document.head.appendChild(metaViewport);
    }

    // Mettre à jour le contenu pour désactiver le zoom
    metaViewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
    );

    // Nettoyer lors du démontage du composant
    return () => {
      // Vérifier que metaViewport existe toujours
      if (metaViewport) {
        metaViewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1"
        );
      }
    };
  }, []);

  // Gérer la sélection d'un type de cuisine
  const toggleCuisine = (cuisine: string) => {
    const newSelection = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter((c) => c !== cuisine)
      : [...selectedCuisines, cuisine];

    setSelectedCuisines(newSelection);
    onFilterChange({
      cuisines: newSelection,
      establishments: selectedEstablishments,
    });
  };

  // Gérer la sélection d'un type d'établissement
  const toggleEstablishment = (establishment: string) => {
    const newSelection = selectedEstablishments.includes(establishment)
      ? selectedEstablishments.filter((e) => e !== establishment)
      : [...selectedEstablishments, establishment];

    setSelectedEstablishments(newSelection);
    onFilterChange({
      cuisines: selectedCuisines,
      establishments: newSelection,
    });
  };

  // Supprimer un filtre
  const removeFilter = (type: "cuisine" | "establishment", value: string) => {
    if (type === "cuisine") {
      const newSelection = selectedCuisines.filter((c) => c !== value);
      setSelectedCuisines(newSelection);
      onFilterChange({
        cuisines: newSelection,
        establishments: selectedEstablishments,
      });
    } else {
      const newSelection = selectedEstablishments.filter((e) => e !== value);
      setSelectedEstablishments(newSelection);
      onFilterChange({
        cuisines: selectedCuisines,
        establishments: newSelection,
      });
    }
  };

  // Effacer tous les filtres
  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedEstablishments([]);
    setRestaurantSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
    onFilterChange({ cuisines: [], establishments: [] });
  };

  // Nombre total de filtres sélectionnés
  const totalFilters =
    selectedCuisines.length +
    selectedEstablishments.length +
    (restaurantSearchTerm ? 1 : 0);

  // Filtrer les options en fonction du terme de recherche
  const filteredCuisines = searchTerm
    ? cuisineTypes.filter((cuisine) =>
        cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cuisineTypes;

  const filteredEstablishments = searchTerm
    ? establishmentTypes.filter((establishment) =>
        establishment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : establishmentTypes;

  // Débogage
  useEffect(() => {
    console.log("Cuisines disponibles:", cuisineTypes);
    console.log("Établissements disponibles:", establishmentTypes);
    console.log("Filtres sélectionnés:", {
      selectedCuisines,
      selectedEstablishments,
    });
  }, [
    cuisineTypes,
    establishmentTypes,
    selectedCuisines,
    selectedEstablishments,
  ]);

  return (
    <div className="w-full relative" ref={searchRef}>
      {/* Barre de recherche avec filtres */}
      <div className="bg-white border-b border-[#D2C8BC] hover:border-[#A89B8C]">
        {/* Champ de recherche */}
        <div className="flex items-center p-2">
          <div className="relative flex-grow">
            <div className="relative flex items-center bg-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#8C7B6B] ml-3"
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
              <input
                type="text"
                placeholder="Rechercher un restaurant..."
                value={restaurantSearchTerm}
                onChange={(e) => setRestaurantSearchTerm(e.target.value)}
                className="w-full py-3 px-3 bg-transparent border-none text-sm text-[#5D4D40] placeholder-[#A89B8C] focus:outline-none text-[16px]"
                style={{ fontSize: "16px" }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {restaurantSearchTerm && (
                <button
                  onClick={() => {
                    setRestaurantSearchTerm("");
                    if (onSearchChange) {
                      onSearchChange("");
                    }
                  }}
                  className="flex items-center justify-center h-8 w-8 mr-1 rounded-full text-[#A89B8C] hover:text-[#6B5D4F] hover:bg-[#F5F2EE] transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <button
            ref={buttonRef}
            className={`ml-2 flex items-center justify-center h-10 w-10 rounded-lg transition-all ${
              showSuggestions || totalFilters > 0
                ? "bg-[#6B5D4F] text-white"
                : "bg-[#F5F2EE] text-[#8C7B6B] hover:bg-[#E8E1D9]"
            }`}
            onClick={() => {
              console.log(
                "Bouton de filtre cliqué, état actuel:",
                showSuggestions
              );
              setShowSuggestions(!showSuggestions);
            }}
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
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>
        </div>

        {/* Affichage des filtres sélectionnés */}
        {totalFilters > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-1.5 items-center border-t border-[#E8E1D9]">
            {/* Affichage des filtres de cuisine (limité en fonction de la taille de l'écran) */}
            {selectedCuisines
              .slice(0, Math.min(maxVisibleFilters, selectedCuisines.length))
              .map((cuisine) => (
                <div
                  key={cuisine}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D2C8BC] text-[#5D4D40] max-w-[150px] truncate"
                >
                  <span className="truncate">{cuisine}</span>
                  <button
                    onClick={() => removeFilter("cuisine", cuisine)}
                    className="ml-1 flex-shrink-0 text-[#5D4D40]/80 hover:text-[#5D4D40]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
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
              ))}

            {/* Affichage des filtres d'établissement (limité à ce qui reste des filtres visibles) */}
            {selectedEstablishments
              .slice(
                0,
                Math.max(
                  0,
                  maxVisibleFilters -
                    selectedCuisines.slice(0, maxVisibleFilters).length
                )
              )
              .map((establishment) => (
                <div
                  key={establishment}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8E1D9] text-[#6B5D4F] max-w-[150px] truncate"
                >
                  <span className="truncate">{establishment}</span>
                  <button
                    onClick={() => removeFilter("establishment", establishment)}
                    className="ml-1 flex-shrink-0 text-[#6B5D4F]/80 hover:text-[#6B5D4F]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
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
              ))}

            {/* Affichage du filtre de recherche (seulement s'il reste de la place dans les filtres visibles) */}
            {restaurantSearchTerm &&
              selectedCuisines.length + selectedEstablishments.length <
                maxVisibleFilters && (
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5F2EE] text-[#5D4D40] max-w-[150px] truncate">
                  <span className="truncate">"{restaurantSearchTerm}"</span>
                  <button
                    onClick={() => {
                      setRestaurantSearchTerm("");
                      if (onSearchChange) {
                        onSearchChange("");
                      }
                    }}
                    className="ml-1 flex-shrink-0 text-[#5D4D40]/80 hover:text-[#5D4D40]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
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
              )}

            {/* Indicateur pour les filtres supplémentaires */}
            {totalFilters > maxVisibleFilters && (
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#6B5D4F] text-white">
                +
                {totalFilters -
                  Math.min(
                    maxVisibleFilters,
                    selectedCuisines.length +
                      selectedEstablishments.length +
                      (restaurantSearchTerm &&
                      selectedCuisines.length + selectedEstablishments.length <
                        maxVisibleFilters
                        ? 1
                        : 0)
                  )}
              </div>
            )}

            <button
              onClick={clearAllFilters}
              className="ml-1 text-xs text-[#8C7B6B] hover:text-[#5D4D40] transition-colors"
            >
              Effacer tout
            </button>
          </div>
        )}
      </div>

      {/* Panneau de filtres - Utilisation de fixed au lieu de absolute pour une meilleure visibilité */}
      {showSuggestions && (
        <>
          {/* Overlay semi-transparent pour s'assurer que le panneau est visible */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-[999]"
            onClick={() => setShowSuggestions(false)}
          />

          {/* Panneau de filtres */}
          <div className="fixed left-0 right-0 top-[4rem] mx-auto max-w-[600px] bg-white rounded-lg shadow-xl border border-[#E8E1D9] z-[1000]">
            {/* Onglets */}
            <div className="flex border-b border-[#E8E1D9]">
              <button
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === "cuisine"
                    ? "text-[#5D4D40] border-b-2 border-[#5D4D40]"
                    : "text-[#8C7B6B]"
                }`}
                onClick={() => setActiveTab("cuisine")}
              >
                Cuisines
              </button>
              <button
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === "establishment"
                    ? "text-[#5D4D40] border-b-2 border-[#5D4D40]"
                    : "text-[#8C7B6B]"
                }`}
                onClick={() => setActiveTab("establishment")}
              >
                Établissements
              </button>
            </div>

            {/* Contenu des onglets */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {activeTab === "cuisine" && (
                <div className="flex flex-wrap gap-2">
                  {cuisineTypes.map((cuisine) => (
                    <button
                      key={cuisine}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedCuisines.includes(cuisine)
                          ? "bg-[#D2C8BC] text-[#5D4D40] font-medium"
                          : "bg-[#F5F2EE] text-[#8C7B6B] hover:bg-[#E8E1D9]"
                      }`}
                      onClick={() => toggleCuisine(cuisine)}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "establishment" && (
                <div className="flex flex-wrap gap-2">
                  {establishmentTypes.map((establishment) => (
                    <button
                      key={establishment}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedEstablishments.includes(establishment)
                          ? "bg-[#E8E1D9] text-[#6B5D4F] font-medium"
                          : "bg-[#F5F2EE] text-[#8C7B6B] hover:bg-[#E8E1D9]"
                      }`}
                      onClick={() => toggleEstablishment(establishment)}
                    >
                      {establishment}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton de fermeture */}
            <div className="p-3 border-t border-[#E8E1D9] flex justify-end">
              <button
                onClick={() => setShowSuggestions(false)}
                className="px-4 py-2 bg-[#6B5D4F] text-white text-sm font-medium rounded-lg hover:bg-[#5D4D40]"
              >
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
