import { initDB } from "./db";

// Cette fonction sera appelée au démarrage de l'application
export async function initialize() {
  try {
    await initDB();
    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error during initialization:", error);
    // Ne pas throw l'erreur ici pour permettre à l'application de démarrer même en cas d'erreur
  }
}
