import { Pool } from "pg";

declare global {
  var pg: Pool | undefined;
}

const pool =
  global.pg ||
  new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.pg = pool;
}

// Types for database operations
export type QueryParams = string | number | boolean | Date | null;
export type QueryResult<T> = {
  rows: T[];
};

export async function initDB() {
  console.log("Starting database initialization...");
  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("Database connection successful");

    // Create restaurants table
    console.log("Creating restaurants table...");
    await pool.query(`
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
    `);
    console.log("Restaurants table created successfully");

    // Create restaurant_images table
    console.log("Creating restaurant_images table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurant_images (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        image_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Restaurant_images table created successfully");

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export async function query<T>(
  queryText: string,
  params: QueryParams[] = []
): Promise<T[]> {
  try {
    const result = await pool.query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export default {
  query,
  initDB,
};
