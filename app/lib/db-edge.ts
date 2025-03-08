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
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const { rows } = await sql`
    SELECT * FROM restaurants 
    ORDER BY created_at DESC
  `;
  return rows;
}

export async function createRestaurant(
  name: string,
  address: string,
  latitude: number,
  longitude: number
): Promise<Restaurant> {
  const { rows } = await sql`
    INSERT INTO restaurants (name, address, latitude, longitude)
    VALUES (${name}, ${address}, ${latitude}, ${longitude})
    RETURNING *
  `;
  return rows[0];
}

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_certified BOOLEAN DEFAULT false
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS restaurant_images (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        image_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
