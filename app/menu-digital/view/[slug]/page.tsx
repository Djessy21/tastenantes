"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Menu {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  slug: string;
  restaurant?: Restaurant;
  categories: Category[];
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  image?: string;
  description?: string;
  is_certified?: boolean;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  order: number;
  menuItems: MenuItem[];
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isSpecial: boolean;
  allergens?: string;
  options: Option[];
  order: number;
}

interface Option {
  id: number;
  name: string;
  description?: string;
  price: number;
}

export default function MenuViewPage() {
  const params = useParams();
  const router = useRouter();
  const menuSlug = params.slug as string;

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`/api/menus/slug/${menuSlug}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du menu");
        }
        const data = await response.json();
        setMenu(data);

        // Définir la première catégorie comme active par défaut
        if (data.categories && data.categories.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuSlug]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Menu non trouvé
          </h2>
          <p className="text-lg">
            Le menu demandé n'existe pas ou a été supprimé.
          </p>
          <Link
            href="/menu-digital"
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-block"
          >
            Retour aux menus
          </Link>
        </div>
      </div>
    );
  }

  // Trier les catégories par ordre
  const sortedCategories = [...menu.categories].sort(
    (a, b) => a.order - b.order
  );

  // Obtenir la catégorie active
  const currentCategory =
    sortedCategories.find((cat) => cat.id === activeCategory) ||
    sortedCategories[0];

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="mb-6">
        {menu.restaurant && (
          <Link
            href={`/menu-digital/restaurant/${menu.restaurant.id}`}
            className="text-primary hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Retour au restaurant
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{menu.name}</h1>
          {menu.restaurant && (
            <p className="text-gray-600 mb-4">{menu.restaurant.name}</p>
          )}
          {menu.description && (
            <p className="text-gray-700 mb-4">{menu.description}</p>
          )}
        </div>
      </div>

      {/* Navigation des catégories */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Affichage des éléments de menu pour la catégorie active */}
      {currentCategory && (
        <div>
          {currentCategory.description && (
            <p className="text-gray-600 mb-6">{currentCategory.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentCategory.menuItems
              .filter((item) => item.isAvailable)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    item.isSpecial ? "border-2 border-primary" : ""
                  }`}
                >
                  {item.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <span className="text-lg font-semibold">
                        {item.price.toFixed(2)} €
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-gray-600 mb-4">{item.description}</p>
                    )}

                    {item.allergens && (
                      <p className="text-sm text-gray-500 mb-2">
                        <span className="font-semibold">Allergènes:</span>{" "}
                        {item.allergens}
                      </p>
                    )}

                    {item.options && item.options.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Options:</h4>
                        <ul className="text-sm text-gray-600">
                          {item.options.map((option) => (
                            <li
                              key={option.id}
                              className="flex justify-between mb-1"
                            >
                              <span>{option.name}</span>
                              <span>+{option.price.toFixed(2)} €</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.isSpecial && (
                      <div className="mt-3">
                        <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded">
                          Spécialité
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
