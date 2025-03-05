import { CertifiedRestaurant, Dish, Location } from "../types/restaurant";
import db from "../lib/db";
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

const certifiedRestaurantService = {
  getCertifiedRestaurants: async (): Promise<CertifiedRestaurant[]> => {
    try {
      const rows = await db.query<CertifiedRestaurantRow>(`
        SELECT 
          r.*,
          d.id as dish_id,
          d.name as dish_name,
          d.description as dish_description,
          d.price as dish_price,
          d.image_url as dish_image_url
        FROM restaurants r
        LEFT JOIN dishes d ON d.restaurant_id = r.id
        WHERE r.certified_by IS NOT NULL
        ORDER BY r.certification_date DESC
      `);

      // Grouper les plats par restaurant
      const restaurantsMap = new Map<string, CertifiedRestaurant>();

      rows.forEach((row) => {
        if (!restaurantsMap.has(row.id)) {
          restaurantsMap.set(row.id, {
            id: row.id,
            name: row.name,
            description: row.description || undefined,
            address: row.address,
            phone: row.phone || undefined,
            email: row.email || undefined,
            website: row.website || undefined,
            image: row.image || undefined,
            cuisine: row.cuisine,
            rating: row.rating,
            priceRange: row.price_range || undefined,
            openingHours: row.opening_hours || undefined,
            location: {
              lat: row.latitude,
              lng: row.longitude,
            },
            dishes: [],
            featured: row.featured,
            specialNote: row.special_note || undefined,
            certifiedBy: row.certified_by,
            certificationDate: row.certification_date.toISOString(),
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at?.toISOString(),
          });
        }

        // Ajouter le plat s'il existe
        if (row.dish_id && row.dish_name && row.dish_price) {
          const restaurant = restaurantsMap.get(row.id)!;
          restaurant.dishes.push({
            id: row.dish_id,
            name: row.dish_name,
            description: row.dish_description || undefined,
            price: row.dish_price,
            imageUrl: row.dish_image_url || undefined,
            restaurantId: row.id,
          });
        }
      });

      return Array.from(restaurantsMap.values());
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
      const id = randomUUID();
      const result = await db.query<CertifiedRestaurantRow>(
        `INSERT INTO restaurants (
          id, name, description, address, phone, email, website,
          image, cuisine, rating, price_range, opening_hours,
          latitude, longitude, certified_by, certification_date,
          special_note, featured
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18
        ) RETURNING *`,
        [
          id,
          restaurant.name,
          restaurant.description || null,
          restaurant.address,
          restaurant.phone || null,
          restaurant.email || null,
          restaurant.website || null,
          restaurant.image || null,
          restaurant.cuisine,
          restaurant.rating,
          restaurant.priceRange || null,
          restaurant.openingHours || null,
          restaurant.location.lat,
          restaurant.location.lng,
          restaurant.certifiedBy,
          restaurant.certificationDate,
          restaurant.specialNote || null,
          restaurant.featured,
        ]
      );

      const row = result[0];
      return {
        ...restaurant,
        id: row.id,
        dishes: [],
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      };
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

      await db.query(`UPDATE restaurants SET ${setClause} WHERE id = $1`, [
        id,
        ...values,
      ]);
    } catch (error) {
      console.error("Error updating certified restaurant:", error);
      throw error;
    }
  },

  deleteCertifiedRestaurant: async (id: string): Promise<void> => {
    try {
      await db.query("DELETE FROM restaurants WHERE id = $1", [id]);
    } catch (error) {
      console.error("Error deleting certified restaurant:", error);
      throw error;
    }
  },

  toggleFeatured: async (id: string): Promise<void> => {
    try {
      await db.query(
        "UPDATE restaurants SET featured = NOT featured WHERE id = $1",
        [id]
      );
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
      const id = randomUUID();
      const result = await db.query<{ id: string }>(
        `INSERT INTO dishes (id, restaurant_id, name, description, price, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          id,
          restaurantId,
          dish.name,
          dish.description || null,
          dish.price,
          dish.imageUrl || null,
        ]
      );

      return {
        ...dish,
        id: result[0].id,
        restaurantId,
      };
    } catch (error) {
      console.error("Error adding dish:", error);
      throw error;
    }
  },

  deleteDish: async (id: string): Promise<void> => {
    try {
      await db.query("DELETE FROM dishes WHERE id = $1", [id]);
    } catch (error) {
      console.error("Error deleting dish:", error);
      throw error;
    }
  },

  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      await db.query("UPDATE restaurants SET image = NULL WHERE image = $1", [
        imageUrl,
      ]);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },
};

export default certifiedRestaurantService;
