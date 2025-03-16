"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Menu {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  slug: string;
  categories?: Category[];
}

interface Category {
  id: number;
  name: string;
  description?: string;
  order: number;
  menuItems?: MenuItem[];
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
  options?: Option[];
}

interface Option {
  id: number;
  name: string;
  description?: string;
  price: number;
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  image?: string;
  description?: string;
  is_certified?: boolean;
  menus?: Menu[];
}

export default function RestaurantMenusPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(
          `/api/restaurants/${restaurantId}?includeMenus=true`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du restaurant");
        }
        const data = await response.json();
        setRestaurant(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des menus...</p>
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

  if (!restaurant) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Restaurant non trouvé
          </h2>
          <p className="text-lg">
            Le restaurant demandé n'existe pas ou a été supprimé.
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

  if (!restaurant.menus || restaurant.menus.length === 0) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <div className="mb-6">
          <Link
            href="/menu-digital"
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
            Retour aux menus
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-64 overflow-hidden relative">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Aucune image</span>
              </div>
            )}
            {restaurant.is_certified && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                Certifié
              </div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-gray-600 mb-4">{restaurant.address}</p>
            {restaurant.description && (
              <p className="text-gray-700 mb-6">{restaurant.description}</p>
            )}
          </div>
        </div>

        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-lg mb-4">
            Ce restaurant n'a pas encore de menus disponibles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="mb-6">
        <Link
          href="/menu-digital"
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
          Retour aux menus
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 overflow-hidden relative">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Aucune image</span>
            </div>
          )}
          {restaurant.is_certified && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
              Certifié
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-gray-600 mb-4">{restaurant.address}</p>
          {restaurant.description && (
            <p className="text-gray-700 mb-6">{restaurant.description}</p>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Menus disponibles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {restaurant.menus
          .filter((menu) => menu.isActive)
          .map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{menu.name}</h3>
                {menu.description && (
                  <p className="text-gray-600 mb-4">{menu.description}</p>
                )}
                <Link
                  href={`/menu-digital/view/${menu.slug}`}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-block"
                >
                  Voir le menu
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
