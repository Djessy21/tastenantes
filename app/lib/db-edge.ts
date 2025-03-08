const NEON_API_URL = process.env.POSTGRES_URL!;

interface Restaurant {
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
  const response = await fetch(NEON_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "SELECT * FROM restaurants ORDER BY created_at DESC",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch restaurants");
  }

  const data = await response.json();
  return data.rows;
}

export async function createRestaurant(
  name: string,
  address: string,
  latitude: number,
  longitude: number
): Promise<Restaurant> {
  const response = await fetch(NEON_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        INSERT INTO restaurants (name, address, latitude, longitude)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      params: [name, address, latitude, longitude],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create restaurant");
  }

  const data = await response.json();
  return data.rows[0];
}

export async function initDB() {
  const response = await fetch(NEON_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        CREATE TABLE IF NOT EXISTS restaurants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_certified BOOLEAN DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS restaurant_images (
          id SERIAL PRIMARY KEY,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          image_type VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize database");
  }

  return true;
}
