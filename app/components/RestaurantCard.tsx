interface Restaurant {
  id: string;
  name: string;
  rating: number;
  address: string;
  cuisine: string;
  image?: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  isSelected: boolean;
}

export default function RestaurantCard({
  restaurant,
  onClick,
  isSelected,
}: RestaurantCardProps) {
  return (
    <div
      className={`dior-card p-4 sm:p-6 transition-all duration-300 ${
        isSelected ? "bg-black text-white" : "bg-white"
      }`}
      onClick={onClick}
    >
      {restaurant.image && (
        <div className="restaurant-image-container mb-3 sm:mb-4">
          <img
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${restaurant.image}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
            alt={restaurant.name}
            className="restaurant-image"
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
      <button
        className={`mt-3 sm:mt-4 text-xs uppercase tracking-widest py-2 px-3 sm:px-4 border ${
          isSelected
            ? "border-white text-white"
            : "border-black text-black active:bg-black active:text-white sm:hover:bg-black sm:hover:text-white"
        } transition-colors duration-300`}
      >
        View Details
      </button>
    </div>
  );
}
