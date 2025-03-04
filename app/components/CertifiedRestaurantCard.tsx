import { useState } from "react";
import { CertifiedRestaurant } from "../services/certifiedRestaurantService";

interface CertifiedRestaurantCardProps {
  restaurant: CertifiedRestaurant;
  onClick: () => void;
  isSelected: boolean;
  onToggleFeatured?: () => void;
  isAdmin?: boolean;
}

export default function CertifiedRestaurantCard({
  restaurant,
  onClick,
  isSelected,
  onToggleFeatured,
  isAdmin = false,
}: CertifiedRestaurantCardProps) {
  const [showDishes, setShowDishes] = useState(false);

  const toggleDishes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDishes(!showDishes);
  };

  return (
    <div
      className={`dior-card p-4 sm:p-6 transition-all duration-300 relative ${
        isSelected ? "bg-black text-white" : "bg-white"
      }`}
      onClick={onClick}
    >
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <div
          className={`px-2 py-1 text-xs uppercase tracking-wider ${
            isSelected ? "bg-white text-black" : "bg-black text-white"
          }`}
        >
          Certifié
        </div>
        {restaurant.featured && (
          <div
            className={`px-2 py-1 text-xs uppercase tracking-wider ${
              isSelected ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            Featured
          </div>
        )}
      </div>

      {restaurant.images?.[0] && (
        <div className="aspect-[4/3] overflow-hidden mb-3 sm:mb-4">
          <img
            src={restaurant.images[0]}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <h3 className="dior-text text-lg sm:text-xl mb-2 uppercase tracking-wider line-clamp-1">
        {restaurant.name}
      </h3>

      <div className="mb-2 sm:mb-3">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < restaurant.rating
                  ? isSelected
                    ? "text-white"
                    : "text-black"
                  : isSelected
                  ? "text-gray-400"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-xs sm:text-sm opacity-75">
            {restaurant.rating}/5
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm uppercase tracking-wider opacity-75 mb-1 sm:mb-2 line-clamp-1">
        {restaurant.cuisine}
      </p>

      <p className="text-xs sm:text-sm opacity-75 font-light line-clamp-2">
        {restaurant.address}
      </p>

      {restaurant.specialNote && (
        <p className="mt-2 text-xs italic opacity-75">
          &ldquo;{restaurant.specialNote}&rdquo;
        </p>
      )}

      <div className="mt-3 sm:mt-4 flex items-center gap-2">
        <button
          className={`text-xs uppercase tracking-widest py-2 px-3 sm:px-4 border flex-1 ${
            isSelected
              ? "border-white text-white"
              : "border-black text-black active:bg-black active:text-white sm:hover:bg-black sm:hover:text-white"
          } transition-colors duration-300`}
          onClick={toggleDishes}
        >
          {showDishes ? "Masquer les Plats" : "Voir les Plats"}
        </button>

        {isAdmin && onToggleFeatured && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFeatured();
            }}
            className={`text-xs uppercase tracking-widest py-2 px-3 sm:px-4 border ${
              restaurant.featured
                ? isSelected
                  ? "border-white text-white"
                  : "border-black text-black"
                : "border-black/50 text-black/50"
            } transition-colors duration-300`}
          >
            {restaurant.featured ? "Featured" : "Feature"}
          </button>
        )}
      </div>

      {showDishes && restaurant.dishes && restaurant.dishes.length > 0 && (
        <div className="mt-4 space-y-4 border-t border-current pt-4">
          <h4 className="text-sm uppercase tracking-wider font-medium">
            Nos Plats
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restaurant.dishes.map((dish) => (
              <div
                key={dish.id}
                className="space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                {dish.imageUrl && (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <h5 className="text-sm font-medium">{dish.name}</h5>
                  {dish.description && (
                    <p className="text-xs opacity-75 line-clamp-2">
                      {dish.description}
                    </p>
                  )}
                  <p className="text-xs font-medium mt-1">
                    {dish.price.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs opacity-50">
        Certifié par {restaurant.certifiedBy} le{" "}
        {new Date(restaurant.certificationDate).toLocaleDateString()}
      </div>
    </div>
  );
}
