import axios from "axios";
import type { CertifiedRestaurant, Dish } from "../types/restaurant";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  is_certified: boolean;
  rating: number;
  cuisine: string;
  specialNote: string;
  certifiedBy: string;
  certificationDate: string;
  featured: boolean;
  website?: string;
  instagram?: string;
}

interface AddRestaurantInput {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  cuisine: string;
  specialNote?: string;
  certifiedBy: string;
  certificationDate: string;
  featured: boolean;
  image_url?: string;
  website?: string;
  instagram?: string;
  photo_credit?: string;
}

const certifiedRestaurantService = {
  getCertifiedRestaurants: async ({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  } = {}): Promise<CertifiedRestaurant[]> => {
    try {
      const response = await axios.get(
        `/api/restaurants?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching certified restaurants:", error);
      return [];
    }
  },

  addCertifiedRestaurant: async (
    restaurant: AddRestaurantInput
  ): Promise<CertifiedRestaurant> => {
    try {
      const response = await axios.post("/api/restaurants", {
        name: restaurant.name,
        address: restaurant.address,
        latitude: restaurant.location.lat,
        longitude: restaurant.location.lng,
        rating: restaurant.rating,
        cuisine: restaurant.cuisine,
        specialNote: restaurant.specialNote,
        certifiedBy: restaurant.certifiedBy,
        certificationDate: restaurant.certificationDate,
        featured: restaurant.featured,
        image_url: restaurant.image_url,
        website: restaurant.website,
        instagram: restaurant.instagram,
        photo_credit: restaurant.photo_credit,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding certified restaurant:", error);
      throw error;
    }
  },

  updateCertifiedRestaurant: async (
    id: string,
    updates: Partial<{
      name: string;
      address: string;
      location: { lat: number; lng: number };
    }>
  ): Promise<void> => {
    try {
      await axios.put(`/api/restaurants/${id}`, updates);
    } catch (error) {
      console.error("Error updating certified restaurant:", error);
      throw error;
    }
  },

  deleteCertifiedRestaurant: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/restaurants/${id}`);
    } catch (error) {
      console.error("Error deleting certified restaurant:", error);
      throw error;
    }
  },

  toggleFeatured: async (id: string): Promise<void> => {
    try {
      await axios.put(`/api/restaurants/${id}/toggle-featured`);
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  },

  addDish: async (
    restaurantId: string,
    dish: {
      name: string;
      description: string;
      price: number;
      image_url: string;
    }
  ): Promise<Dish> => {
    try {
      const response = await axios.post(
        `/api/restaurants/${restaurantId}/dishes`,
        dish
      );
      return response.data;
    } catch (error) {
      console.error("Error adding dish:", error);
      throw error;
    }
  },

  deleteDish: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/dishes/${id}`);
    } catch (error) {
      console.error("Error deleting dish:", error);
      throw error;
    }
  },

  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      await axios.put("/api/restaurants/delete-image", { imageUrl });
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },
};

export default certifiedRestaurantService;
