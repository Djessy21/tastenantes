import { useState, useRef, useEffect } from "react";

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
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fermer les suggestions lorsqu'on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSearchFocused(false);
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

  // Supprimer un filtre de cuisine
  const removeCuisineFilter = (cuisine: string) => {
    const newSelection = selectedCuisines.filter((c) => c !== cuisine);
    setSelectedCuisines(newSelection);
    onFilterChange({
      cuisines: newSelection,
      establishments: selectedEstablishments,
    });
  };

  // Supprimer un filtre d'établissement
  const removeEstablishmentFilter = (establishment: string) => {
    const newSelection = selectedEstablishments.filter(
      (e) => e !== establishment
    );
    setSelectedEstablishments(newSelection);
    onFilterChange({
      cuisines: selectedCuisines,
      establishments: newSelection,
    });
  };

  // Effacer tous les filtres
  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedEstablishments([]);
    onFilterChange({ cuisines: [], establishments: [] });
  };

  // Nombre total de filtres sélectionnés
  const totalFilters = selectedCuisines.length + selectedEstablishments.length;

  return (
    <div className="w-full" ref={searchRef}>
      {/* Barre de recherche avec filtres */}
      <div
        className={`relative bg-white transition-all duration-300 ${
          searchFocused
            ? "border-b-2 border-stone-400"
            : "border-b border-stone-200 hover:border-stone-300"
        }`}
      >
        {/* Champ de recherche */}
        <div
          className="px-5 py-3.5 flex items-center cursor-pointer"
          onClick={() => {
            setShowSuggestions(!showSuggestions);
            setSearchFocused(!showSuggestions);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-stone-400 flex-shrink-0"
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
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#ff3f33] text-white max-w-[150px] truncate"
                  >
                    <span className="truncate">{cuisine}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCuisineFilter(cuisine);
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
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#ef1c02] text-white max-w-[150px] truncate"
                  >
                    <span className="truncate">{establishment}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEstablishmentFilter(establishment);
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
                setSearchFocused(!showSuggestions);
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
        {showSuggestions && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50 transform origin-top transition-all duration-200 ease-out">
            {/* Types de cuisine */}
            <div className="p-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">
                Types de cuisine
              </h3>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedCuisines.includes(cuisine)
                        ? "bg-[#ef1c02] text-white font-medium"
                        : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                    }`}
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Types d'établissement */}
            <div className="p-4 border-t border-stone-100">
              <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">
                Types d'établissement
              </h3>
              <div className="flex flex-wrap gap-2">
                {establishmentTypes.map((establishment) => (
                  <button
                    key={establishment}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedEstablishments.includes(establishment)
                        ? "bg-[#ef1c02] text-white font-medium"
                        : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                    }`}
                    onClick={() => toggleEstablishment(establishment)}
                  >
                    {establishment}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
