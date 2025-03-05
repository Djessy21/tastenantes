import { sql, QueryResultRow } from "@vercel/postgres";

// Types for database operations
export type QueryParams = string | number | boolean | Date | null;
export type QueryResult<T extends QueryResultRow> = {
  rows: T[];
};

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS restaurants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        website TEXT,
        image TEXT,
        cuisine TEXT NOT NULL,
        rating DECIMAL NOT NULL,
        price_range TEXT,
        opening_hours TEXT,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        certified_by TEXT,
        certification_date TIMESTAMP WITH TIME ZONE,
        special_note TEXT,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS dishes (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS restaurant_images (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        is_main BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      );
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export async function query<T extends QueryResultRow>(
  queryText: string,
  params: QueryParams[] = []
): Promise<T[]> {
  try {
    const result = await sql.query<T>(queryText, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Export default object with all database operations
const db = {
  init: initDB,
  query,
};

export default db;
