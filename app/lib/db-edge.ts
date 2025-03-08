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
}

export interface Dish {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
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
  featured: boolean
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
      is_certified
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
      true
    )
    RETURNING *
  `;
  return rows[0];
}

export async function getDishes(restaurantId: number): Promise<Dish[]> {
  const { rows } = await sql<Dish>`
    SELECT 
      d.*,
      ri.image_url
    FROM dishes d
    LEFT JOIN restaurant_images ri ON ri.id = d.image_id
    WHERE d.restaurant_id = ${restaurantId}
      AND (ri.image_type = 'dish' OR ri.image_type IS NULL)
    ORDER BY d.created_at DESC
  `;
  return rows;
}

export async function createDish(
  restaurantId: number,
  name: string,
  description: string,
  price: number,
  imageUrl?: string
): Promise<Dish> {
  let imageId = null;

  if (imageUrl) {
    const {
      rows: [image],
    } = await sql`
      INSERT INTO restaurant_images (restaurant_id, image_url, image_type)
      VALUES (${restaurantId}, ${imageUrl}, 'dish')
      RETURNING id
    `;
    imageId = image.id;
  }

  const {
    rows: [dish],
  } = await sql<Dish>`
    INSERT INTO dishes (
      restaurant_id,
      name,
      description,
      price,
      image_id
    ) VALUES (
      ${restaurantId},
      ${name},
      ${description},
      ${price},
      ${imageId}
    )
    RETURNING *
  `;

  return {
    ...dish,
    image_url: imageUrl,
  };
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
    // Vérifier si le schéma est correct
    const isSchemaValid = await checkTableSchema();

    if (!isSchemaValid) {
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
          is_certified BOOLEAN DEFAULT false
        )
      `;

      // Créer la table restaurant_images
      await sql`
        CREATE TABLE IF NOT EXISTS restaurant_images (
          id SERIAL PRIMARY KEY,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          image_type VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Créer la table dishes
      await sql`
        CREATE TABLE IF NOT EXISTS dishes (
          id SERIAL PRIMARY KEY,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price NUMERIC(10,2) NOT NULL,
          image_id INTEGER REFERENCES restaurant_images(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
    }

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
