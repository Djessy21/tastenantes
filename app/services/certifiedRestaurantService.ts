import { Restaurant } from "./restaurantService";
import db from "../lib/db";
import { QueryResultRow } from "@vercel/postgres";

export interface CertifiedRestaurant extends Restaurant {
  certifiedBy: string;
  certificationDate: Date;
  specialNote: string | null;
  featured: boolean;
  createdAt: Date;
}

interface CertifiedRestaurantRow extends QueryResultRow {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  rating: number;
  special_note: string | null;
  latitude: number;
  longitude: number;
  certified_by: string;
  certification_date: Date;
  featured: boolean;
  created_at: Date;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

const certifiedRestaurantService = {
  getCertifiedRestaurants: async (): Promise<CertifiedRestaurant[]> => {
    try {
      const rows = await db.query<CertifiedRestaurantRow>(`
        SELECT 
          r.*,
          r.certified_by as "certifiedBy",
          r.certification_date as "certificationDate"
        FROM restaurants r
        WHERE r.certified_by IS NOT NULL
        ORDER BY r.certification_date DESC
      `);

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        cuisine: row.cuisine,
        rating: row.rating,
        specialNote: row.special_note,
        location: {
          lat: row.latitude,
          lng: row.longitude,
        },
        certifiedBy: row.certified_by,
        certificationDate: row.certification_date,
        featured: row.featured,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error fetching certified restaurants:", error);
      return [];
    }
  },

  addCertifiedRestaurant: async (
    restaurant: Omit<
      CertifiedRestaurant,
      "id" | "certificationDate" | "createdAt"
    >
  ) => {
    try {
      const result = await db.query<CertifiedRestaurantRow>(
        `
        INSERT INTO restaurants (
          id, 
          name, 
          address, 
          cuisine, 
          rating, 
          special_note,
          latitude,
          longitude,
          certified_by,
          featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
        [
          crypto.randomUUID(),
          restaurant.name,
          restaurant.address,
          restaurant.cuisine,
          restaurant.rating,
          restaurant.specialNote,
          restaurant.location.lat,
          restaurant.location.lng,
          restaurant.certifiedBy,
          restaurant.featured,
        ]
      );

      if (!result.length) {
        throw new Error("Failed to insert restaurant");
      }

      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        address: row.address,
        cuisine: row.cuisine,
        rating: row.rating,
        specialNote: row.special_note,
        location: {
          lat: row.latitude,
          lng: row.longitude,
        },
        certifiedBy: row.certified_by,
        certificationDate: row.certification_date,
        featured: row.featured,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("Error adding certified restaurant:", error);
      throw error;
    }
  },

  // Mettre à jour un restaurant certifié
  updateCertifiedRestaurant: async (
    id: string,
    updates: Partial<CertifiedRestaurant>
  ) => {
    const stmt = db.prepare(`
      UPDATE restaurants
      SET name = COALESCE(?, name),
          address = COALESCE(?, address),
          cuisine = COALESCE(?, cuisine),
          rating = COALESCE(?, rating),
          special_note = COALESCE(?, special_note),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          featured = COALESCE(?, featured)
      WHERE id = ?
    `);

    stmt.run(
      updates.name,
      updates.address,
      updates.cuisine,
      updates.rating,
      updates.specialNote,
      updates.location?.lat,
      updates.location?.lng,
      updates.featured !== undefined ? (updates.featured ? 1 : 0) : null,
      id
    );

    return this.getCertifiedRestaurants().then((restaurants) =>
      restaurants.find((r) => r.id === id)
    );
  },

  // Supprimer un restaurant certifié
  deleteCertifiedRestaurant: async (id: string) => {
    const stmt = db.prepare("DELETE FROM restaurants WHERE id = ?");
    stmt.run(id);
  },

  // Basculer le statut "featured" d'un restaurant
  toggleFeatured: async (id: string) => {
    const stmt = db.prepare(`
      UPDATE restaurants
      SET featured = NOT featured
      WHERE id = ?
    `);
    stmt.run(id);

    return this.getCertifiedRestaurants().then((restaurants) =>
      restaurants.find((r) => r.id === id)
    );
  },

  // Ajouter une image à un restaurant
  addRestaurantImage: async (
    restaurantId: string,
    imageUrl: string,
    isMain: boolean = false
  ) => {
    const stmt = db.prepare(`
      INSERT INTO restaurant_images (
        id, restaurant_id, image_url, is_main
      ) VALUES (?, ?, ?, ?)
    `);

    if (isMain) {
      // Mettre à jour les autres images pour ne plus être principales
      db.prepare(
        `
        UPDATE restaurant_images
        SET is_main = 0
        WHERE restaurant_id = ?
      `
      ).run(restaurantId);
    }

    stmt.run(Date.now().toString(), restaurantId, imageUrl, isMain ? 1 : 0);
  },

  // Ajouter un plat à un restaurant
  addDish: async (restaurantId: string, dish: Omit<Dish, "id">) => {
    const stmt = db.prepare(`
      INSERT INTO dishes (
        id, restaurant_id, name, description, price, image_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const dishId = Date.now().toString();
    stmt.run(
      dishId,
      restaurantId,
      dish.name,
      dish.description || null,
      dish.price,
      dish.imageUrl || null
    );

    return { id: dishId, ...dish };
  },

  // Supprimer un plat
  deleteDish: async (dishId: string) => {
    const stmt = db.prepare("DELETE FROM dishes WHERE id = ?");
    stmt.run(dishId);
  },
};

export default certifiedRestaurantService;
