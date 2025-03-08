import axios from "axios";
import { CertifiedRestaurant, Dish, Location } from "../types/restaurant";
import { QueryResultRow } from "@vercel/postgres";
import { randomUUID } from "crypto";

interface CertifiedRestaurantRow extends QueryResultRow {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  image: string | null;
  cuisine: string;
  rating: number;
  price_range: string | null;
  opening_hours: string | null;
  special_note: string | null;
  latitude: number;
  longitude: number;
  certified_by: string;
  certification_date: Date;
  featured: boolean;
  created_at: Date;
  updated_at: Date | null;
  // Colonnes des plats
  dish_id: string | null;
  dish_name: string | null;
  dish_description: string | null;
  dish_price: number | null;
  dish_image_url: string | null;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  is_certified: boolean;
}

const certifiedRestaurantService = {
  getCertifiedRestaurants: async (): Promise<CertifiedRestaurant[]> => {
    try {
      const response = await axios.get("/api/restaurants");
      return response.data;
    } catch (error) {
      console.error("Error fetching certified restaurants:", error);
      return [];
    }
  },

  addCertifiedRestaurant: async (
    restaurant: Omit<
      CertifiedRestaurant,
      "id" | "dishes" | "createdAt" | "updatedAt"
    >
  ): Promise<CertifiedRestaurant> => {
    try {
      const response = await axios.post("/api/restaurants", restaurant);
      return response.data;
    } catch (error) {
      console.error("Error adding certified restaurant:", error);
      throw error;
    }
  },

  updateCertifiedRestaurant: async (
    id: string,
    updates: Partial<
      Omit<CertifiedRestaurant, "id" | "dishes" | "createdAt" | "updatedAt">
    >
  ): Promise<void> => {
    try {
      const setClause = Object.entries(updates)
        .map(([key], index) => {
          const dbKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`
          );
          return `${dbKey} = $${index + 2}`;
        })
        .join(", ");

      const values = Object.values(updates).map((value) => {
        if (
          value &&
          typeof value === "object" &&
          "lat" in value &&
          "lng" in value
        ) {
          return (value as Location).lat;
        }
        return value ?? null;
      });

      await axios.put(`/api/restaurants/${id}`, {
        ...updates,
        ...(values.length > 0
          ? {
              latitude: values[0],
              longitude: values[1],
            }
          : {}),
      });
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
    dish: Omit<Dish, "id" | "restaurantId">
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
      await axios.delete(`/api/restaurants/${id}/dishes/${id}`);
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
