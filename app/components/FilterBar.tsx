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
}

export default function FilterBar({
  cuisineTypes,
  establishmentTypes,
  onFilterChange,
}: FilterProps) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<
    string[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<"cuisine" | "establishment">(
    "cuisine"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    onFilterChange({ cuisines: [], establishments: [] });
  };

  // Nombre total de filtres sélectionnés
  const totalFilters = selectedCuisines.length + selectedEstablishments.length;

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
            ? "border-b-2 border-red-400"
            : "border-b border-stone-200 hover:border-stone-300"
        }`}
      >
        {/* Champ de recherche */}
        <div
          className="px-5 py-3.5 flex items-center cursor-pointer"
          onClick={() => {
            setShowSuggestions(!showSuggestions);
          }}
        >
          <button
            ref={buttonRef}
            className={`flex items-center justify-center p-2 rounded-full transition-all ${
              showSuggestions || totalFilters > 0
                ? "bg-stone-500 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
            aria-expanded={showSuggestions}
            aria-controls="filter-panel"
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

          <div className="ml-3 flex-grow truncate">
            {totalFilters === 0 ? (
              <span className="text-stone-500">
                Filtrer par cuisine ou type d'établissement
              </span>
            ) : (
              <div className="flex flex-wrap gap-1.5 items-center">
                {selectedCuisines.map((cuisine) => (
                  <div
                    key={cuisine}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${"bg-stone-400 text-white"} max-w-[150px] truncate`}
                  >
                    <span className="truncate">{cuisine}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFilter("cuisine", cuisine);
                      }}
                      className="ml-1 flex-shrink-0 text-white/80 hover:text-white"
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

                {selectedEstablishments.map((establishment) => (
                  <div
                    key={establishment}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${"bg-stone-600 text-white"} max-w-[150px] truncate`}
                  >
                    <span className="truncate">{establishment}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFilter("establishment", establishment);
                      }}
                      className="ml-1 flex-shrink-0 text-white/80 hover:text-white"
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

                {totalFilters > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    className="ml-1 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                    aria-label="Effacer tous les filtres"
                  >
                    Effacer
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ml-2 flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                showSuggestions ? "bg-stone-100" : "bg-transparent"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setShowSuggestions(!showSuggestions);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-stone-500 transition-transform duration-300 ${
                  showSuggestions ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Suggestions de filtres */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50 transform origin-top"
            >
              {/* Barre de recherche */}
              <div className="p-3 border-b border-stone-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un filtre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2"
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
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
              <div className="flex border-b border-stone-100">
                <button
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === "cuisine"
                      ? "text-stone-500 border-b-2 border-stone-500"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  onClick={() => setActiveTab("cuisine")}
                >
                  Types de cuisine
                </button>
                <button
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === "establishment"
                      ? "text-stone-700 border-b-2 border-stone-700"
                      : "text-stone-500 hover:text-stone-800"
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
                              ? "bg-stone-400 text-white font-medium"
                              : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200"
                          }`}
                          onClick={() => toggleCuisine(cuisine)}
                        >
                          {cuisine}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-stone-500 py-2">
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
                              ? "bg-stone-600 text-white font-medium"
                              : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200"
                          }`}
                          onClick={() => toggleEstablishment(establishment)}
                        >
                          {establishment}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-stone-500 py-2">
                        Aucun type d'établissement trouvé
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pied du panneau avec boutons d'action */}
              <div className="p-3 border-t border-stone-100 flex justify-between">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
                >
                  Effacer tous les filtres
                </button>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="px-4 py-1.5 bg-stone-500 text-white text-sm font-medium rounded-full hover:bg-stone-600 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
