import { sql } from "@vercel/postgres";

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
  special_note: string;
  certified_by: string;
  certification_date: string;
  featured: boolean;
  image?: string;
  image_url?: string;
}

export interface Dish {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  created_at: string;
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const { rows } = await sql<Restaurant>`
    SELECT * FROM restaurants 
    ORDER BY created_at DESC
  `;
  return rows;
}

export async function createRestaurant(
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  rating: number,
  cuisine: string,
  specialNote: string,
  certifiedBy: string,
  certificationDate: string,
  featured: boolean,
  image_url: string = ""
): Promise<Restaurant> {
  const { rows } = await sql<Restaurant>`
    INSERT INTO restaurants (
      name, 
      address, 
      latitude, 
      longitude,
      rating,
      cuisine,
      special_note,
      certified_by,
      certification_date,
      featured,
      is_certified,
      image
    ) VALUES (
      ${name}, 
      ${address}, 
      ${latitude}, 
      ${longitude},
      ${rating},
      ${cuisine},
      ${specialNote},
      ${certifiedBy},
      ${certificationDate},
      ${featured},
      true,
      ${image_url}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function getDishes(restaurantId: number): Promise<Dish[]> {
  const { rows } = await sql<Dish>`
    SELECT 
      d.id,
      d.restaurant_id,
      d.name,
      d.description,
      d.price,
      d.image_url,
      d.created_at
    FROM dishes d
    WHERE d.restaurant_id = ${restaurantId}
    ORDER BY d.created_at DESC
  `;

  return rows;
}

export async function createDish(
  restaurantId: number,
  name: string,
  description: string,
  price: number,
  imageUrl: string
): Promise<Dish> {
  const {
    rows: [dish],
  } = await sql<Dish>`
    INSERT INTO dishes (
      restaurant_id,
      name,
      description,
      price,
      image_url
    ) VALUES (
      ${restaurantId},
      ${name},
      ${description},
      ${price},
      ${imageUrl}
    )
    RETURNING *
  `;

  return dish;
}

async function checkTableSchema() {
  try {
    const { rows } = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants'
    `;

    const requiredColumns = [
      "rating",
      "cuisine",
      "special_note",
      "certified_by",
      "certification_date",
      "featured",
    ];

    const existingColumns = rows.map((row) => row.column_name);
    const missingColumns = requiredColumns.filter(
      (col) => !existingColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      console.log("Missing columns:", missingColumns);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking table schema:", error);
    return false;
  }
}

export async function initDB() {
  try {
    // Supprimer les tables existantes
    await sql`DROP TABLE IF EXISTS dishes CASCADE`;
    await sql`DROP TABLE IF EXISTS restaurant_images CASCADE`;
    await sql`DROP TABLE IF EXISTS restaurants CASCADE`;

    // Créer la table restaurants avec le nouveau schéma
    await sql`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        rating NUMERIC(3,1),
        cuisine VARCHAR(100),
        special_note TEXT,
        certified_by VARCHAR(100),
        certification_date TIMESTAMP WITH TIME ZONE,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_certified BOOLEAN DEFAULT false,
        image TEXT
      )
    `;

    // Créer la table restaurant_images
    await sql`
      CREATE TABLE IF NOT EXISTS restaurant_images (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        image_type VARCHAR(50) NOT NULL,
        is_main BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Créer la table dishes avec l'URL de l'image directement
    await sql`
      CREATE TABLE IF NOT EXISTS dishes (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Ajouter une fonction pour sauvegarder une image
export async function saveImage(
  restaurantId: number,
  imageUrl: string,
  imageType: string,
  isMain: boolean = false
): Promise<void> {
  await sql`
    INSERT INTO restaurant_images (
      restaurant_id,
      image_url,
      image_type,
      is_main
    ) VALUES (
      ${restaurantId},
      ${imageUrl},
      ${imageType},
      ${isMain}
    )
  `;
}

export async function getRestaurantById(
  id: number
): Promise<Restaurant | null> {
  try {
    const { rows } = await sql<Restaurant>`
      SELECT * FROM restaurants 
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching restaurant by ID:", error);
    throw error;
  }
}

export async function deleteRestaurant(id: number): Promise<void> {
  try {
    await sql`
      DELETE FROM restaurants 
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw error;
  }
}
