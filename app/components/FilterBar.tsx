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
  const filterRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fermer les suggestions lorsqu'on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
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
    <div className="w-full relative">
      {/* Barre de filtres compacte */}
      <div className="flex items-center gap-2 mb-2">
        {/* Bouton principal pour ouvrir le panneau de filtres */}
        <button
          ref={buttonRef}
          onClick={() => setShowSuggestions(!showSuggestions)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            showSuggestions || totalFilters > 0
              ? "border-stone-400 bg-stone-50"
              : "border-stone-200 hover:border-stone-300"
          }`}
          aria-expanded={showSuggestions}
          aria-controls="filter-panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-stone-500"
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
          <span className="text-sm font-medium">
            {totalFilters > 0 ? `Filtres (${totalFilters})` : "Filtres"}
          </span>
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
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Affichage des filtres sélectionnés sous forme de pills */}
        <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-x-auto pb-1 max-h-10">
          {selectedCuisines.map((cuisine) => (
            <span
              key={`cuisine-${cuisine}`}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 whitespace-nowrap"
            >
              <span className="truncate max-w-[120px]">{cuisine}</span>
              <button
                onClick={() => removeFilter("cuisine", cuisine)}
                className="ml-1 flex-shrink-0 text-red-500 hover:text-red-700"
                aria-label={`Supprimer le filtre ${cuisine}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
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
            </span>
          ))}

          {selectedEstablishments.map((establishment) => (
            <span
              key={`establishment-${establishment}`}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap"
            >
              <span className="truncate max-w-[120px]">{establishment}</span>
              <button
                onClick={() => removeFilter("establishment", establishment)}
                className="ml-1 flex-shrink-0 text-amber-500 hover:text-amber-700"
                aria-label={`Supprimer le filtre ${establishment}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
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
            </span>
          ))}

          {totalFilters > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors whitespace-nowrap ml-1"
              aria-label="Effacer tous les filtres"
            >
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {/* Panneau de filtres */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            id="filter-panel"
            ref={filterRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-stone-200 z-50 max-h-[70vh] overflow-hidden"
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
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                onClick={() => setActiveTab("cuisine")}
              >
                Types de cuisine
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "establishment"
                    ? "text-amber-600 border-b-2 border-amber-600"
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
                            ? "bg-red-600 text-white font-medium"
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
                            ? "bg-amber-600 text-white font-medium"
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
                className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
