/**
 * Script pour supprimer tous les restaurants de la base de données
 *
 * Utilisation:
 * npm run clear-restaurants
 *
 * Ce script supprime tous les restaurants et leurs plats associés de la base de données.
 * Utile pour nettoyer la base de données avant de la remplir avec de nouvelles données.
 */

import { PrismaClient } from "@prisma/client";
import { getEnvironment } from "../app/lib/env";

// Initialiser le client Prisma
const prisma = new PrismaClient();

async function clearRestaurants() {
  // Vérifier l'environnement pour éviter de supprimer accidentellement les données de production
  const env = getEnvironment();

  if (env === "production") {
    console.error(
      "⛔ ATTENTION: Ce script ne peut pas être exécuté en environnement de production."
    );
    console.error(
      "Utilisez l'option --force si vous êtes absolument sûr de vouloir supprimer toutes les données de production."
    );

    // Vérifier si l'option --force est présente
    if (!process.argv.includes("--force")) {
      console.error("Opération annulée.");
      process.exit(1);
    }

    console.warn(
      "⚠️ Option --force détectée. Suppression des données de production..."
    );
  }

  try {
    console.log("🗑️ Suppression de tous les restaurants et plats associés...");

    // Supprimer tous les restaurants (cela supprimera également les plats associés grâce aux relations)
    const deletedCount = await prisma.restaurant.deleteMany({});

    console.log(
      `✅ ${deletedCount.count} restaurants ont été supprimés avec succès.`
    );
    console.log("Tous les plats associés ont également été supprimés.");

    return deletedCount.count;
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des restaurants:", error);
    throw error;
  } finally {
    // Fermer la connexion Prisma
    await prisma.$disconnect();
  }
}

// Exécuter la fonction si le script est appelé directement
if (require.main === module) {
  clearRestaurants()
    .then((count) => {
      console.log(`📊 Opération terminée. ${count} restaurants supprimés.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

// Exporter la fonction pour pouvoir l'utiliser dans d'autres scripts
export default clearRestaurants;
