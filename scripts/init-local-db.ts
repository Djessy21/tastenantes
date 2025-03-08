import { initDB } from "../app/lib/db-edge";

async function main() {
  try {
    console.log("Initializing database...");
    await initDB();
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
