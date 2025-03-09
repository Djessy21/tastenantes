const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function setupAuthTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Connecting to database...");
    const client = await pool.connect();

    console.log("Reading SQL file...");
    const sqlPath = path.join(
      __dirname,
      "../prisma/migrations/auth_tables.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Executing SQL commands...");
    await client.query(sql);

    console.log("Authentication tables setup completed successfully!");
    client.release();
  } catch (error) {
    console.error("Error setting up authentication tables:", error);
  } finally {
    await pool.end();
  }
}

setupAuthTables();
