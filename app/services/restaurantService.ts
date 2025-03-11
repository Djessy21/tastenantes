import axios from "axios";

export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  address: string;
  cuisine: string;
  location: Location;
  image?: string;
}

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const restaurantService = {
  async searchNearby({
    lat,
    lng,
    page = 1,
    limit = 10,
  }: {
    lat: number;
    lng: number;
    page?: number;
    limit?: number;
  }): Promise<Restaurant[]> {
    try {
      // Simuler la pagination côté client car l'API Google Places ne supporte pas la pagination directement
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`
      );

      const allResults = response.data.results;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = allResults.slice(startIndex, endIndex);

      return paginatedResults.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        rating: place.rating || 0,
        address: place.vicinity,
        cuisine: place.types?.includes("restaurant")
          ? "Restaurant"
          : place.types?.[0] || "Non spécifié",
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        image: place.photos?.[0]?.photo_reference,
      }));
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }
  },

  async getDetails(placeId: string): Promise<Restaurant | null> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,type,geometry,photo&key=${GOOGLE_PLACES_API_KEY}`
      );

      const place = response.data.result;
      return {
        id: placeId,
        name: place.name,
        rating: place.rating || 0,
        address: place.formatted_address,
        cuisine: place.types?.includes("restaurant") ? "Restaurant" : "Unknown",
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        image: place.photos?.[0]?.photo_reference,
      };
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      return null;
    }
  },
};
