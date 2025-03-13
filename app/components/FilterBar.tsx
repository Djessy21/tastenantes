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
      metaViewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1"
      );
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

  return (
    <div className="w-full" ref={searchRef}>
      {/* Barre de recherche avec filtres */}
      <div
        className={`relative bg-white transition-all duration-300 ${
          showSuggestions
            ? "border-b-2 border-[#6B5D4F]"
            : "border-b border-[#D2C8BC] hover:border-[#A89B8C]"
        }`}
      >
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
            aria-expanded={showSuggestions}
            aria-controls="filter-panel"
            onClick={() => setShowSuggestions(!showSuggestions)}
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>

        {/* Affichage des filtres sélectionnés */}
        {totalFilters > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-1.5 items-center border-t border-[#E8E1D9]">
            {isMobile ? (
              // Affichage compact pour mobile
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D2C8BC] text-[#5D4D40]">
                {totalFilters} filtre{totalFilters > 1 ? "s" : ""} actif
                {totalFilters > 1 ? "s" : ""}
              </div>
            ) : (
              // Affichage normal pour desktop
              <>
                {/* Affichage des filtres de cuisine */}
                {selectedCuisines.map((cuisine) => (
                  <div
                    key={cuisine}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D2C8BC] text-[#5D4D40] max-w-[150px] truncate"
                  >
                    <span className="truncate">{cuisine}</span>
                    <button
                      onClick={() => removeFilter("cuisine", cuisine)}
                      className="ml-1 flex-shrink-0 text-[#5D4D40]/80 hover:text-[#5D4D40]"
                      aria-label={`Supprimer le filtre ${cuisine}`}
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

                {/* Affichage des filtres d'établissement */}
                {selectedEstablishments.map((establishment) => (
                  <div
                    key={establishment}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8E1D9] text-[#6B5D4F] max-w-[150px] truncate"
                  >
                    <span className="truncate">{establishment}</span>
                    <button
                      onClick={() =>
                        removeFilter("establishment", establishment)
                      }
                      className="ml-1 flex-shrink-0 text-[#6B5D4F]/80 hover:text-[#6B5D4F]"
                      aria-label={`Supprimer le filtre ${establishment}`}
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

                {/* Affichage du filtre de recherche si présent */}
                {restaurantSearchTerm && (
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5F2EE] text-[#5D4D40] max-w-[150px] truncate">
                    <span className="truncate">
                      {`"${restaurantSearchTerm}"`}
                    </span>
                    <button
                      onClick={() => {
                        setRestaurantSearchTerm("");
                        if (onSearchChange) {
                          onSearchChange("");
                        }
                      }}
                      className="ml-1 flex-shrink-0 text-[#5D4D40]/80 hover:text-[#5D4D40]"
                      aria-label={`Supprimer la recherche ${restaurantSearchTerm}`}
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
              </>
            )}

            {totalFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-1 text-xs text-[#8C7B6B] hover:text-[#5D4D40] transition-colors"
                aria-label="Effacer tous les filtres"
              >
                Effacer tout
              </button>
            )}
          </div>
        )}

        {/* Suggestions de filtres */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E8E1D9] overflow-hidden z-50 transform origin-top"
            >
              {/* Barre de recherche pour les filtres */}
              <div className="p-3 border-b border-[#E8E1D9]">
                <div className="relative flex items-center bg-[#F5F2EE] rounded-lg overflow-hidden">
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
                    placeholder="Rechercher un filtre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 px-3 bg-transparent border-none text-sm text-[#5D4D40] placeholder-[#A89B8C] focus:outline-none text-[16px]"
                    style={{ fontSize: "16px" }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="flex items-center justify-center h-8 w-8 mr-1 rounded-full text-[#A89B8C] hover:text-[#6B5D4F] hover:bg-[#EFE9E3] transition-colors"
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

              {/* Onglets */}
              <div className="flex border-b border-[#E8E1D9]">
                <button
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === "cuisine"
                      ? "text-[#5D4D40] border-b-2 border-[#6B5D4F]"
                      : "text-[#8C7B6B] hover:text-[#5D4D40]"
                  }`}
                  onClick={() => setActiveTab("cuisine")}
                >
                  Types de cuisine
                </button>
                <button
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === "establishment"
                      ? "text-[#5D4D40] border-b-2 border-[#8C7B6B]"
                      : "text-[#8C7B6B] hover:text-[#5D4D40]"
                  }`}
                  onClick={() => setActiveTab("establishment")}
                >
                  Types d'établissement
                </button>
              </div>

              {/* Contenu des onglets */}
              <div className="overflow-y-auto max-h-[50vh] p-4">
                {activeTab === "cuisine" ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredCuisines.length > 0 ? (
                      filteredCuisines.map((cuisine) => (
                        <button
                          key={cuisine}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedCuisines.includes(cuisine)
                              ? "bg-[#D2C8BC] text-[#5D4D40] font-medium"
                              : "bg-[#F5F2EE] text-[#6B5D4F] hover:bg-[#E8E1D9] border border-[#E8E1D9]"
                          }`}
                          onClick={() => toggleCuisine(cuisine)}
                        >
                          {cuisine}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-[#8C7B6B] py-2">
                        Aucun type de cuisine trouvé
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {filteredEstablishments.length > 0 ? (
                      filteredEstablishments.map((establishment) => (
                        <button
                          key={establishment}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedEstablishments.includes(establishment)
                              ? "bg-[#E8E1D9] text-[#6B5D4F] font-medium"
                              : "bg-[#F5F2EE] text-[#8C7B6B] hover:bg-[#E8E1D9] border border-[#E8E1D9]"
                          }`}
                          onClick={() => toggleEstablishment(establishment)}
                        >
                          {establishment}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-[#8C7B6B] py-2">
                        Aucun type d'établissement trouvé
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pied du panneau avec boutons d'action */}
              <div className="p-3 border-t border-[#E8E1D9] flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-[#8C7B6B] hover:text-[#5D4D40] transition-colors"
                  >
                    Effacer tous les filtres
                  </button>
                  <span className="ml-3 text-xs text-[#A89B8C] italic">
                    Les filtres sont appliqués automatiquement
                  </span>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="px-4 py-1.5 bg-[#D2C8BC] text-[#5D4D40] text-sm font-medium rounded-full hover:bg-[#C4B8A8] hover:text-[#4A3C31] transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
