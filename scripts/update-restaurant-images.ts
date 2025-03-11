/**
 * Script pour mettre à jour les images de tous les restaurants
 *
 * Utilisation:
 * npm run update-images
 *
 * Ce script met à jour les images de tous les restaurants dans la base de données
 * en leur attribuant une URL d'image valide depuis Unsplash.
 */

import { PrismaClient } from "@prisma/client";
import { getEnvironment } from "../app/lib/env";

// Initialiser le client Prisma
const prisma = new PrismaClient();

// Liste d'images de restaurants de haute qualité
const restaurantImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000",
  "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=1000",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=1000",
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1000",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000",
];

async function updateRestaurantImages() {
  // Vérifier l'environnement pour éviter de modifier accidentellement les données de production
  const env = getEnvironment();

  if (env === "production") {
    console.error(
      "⛔ ATTENTION: Ce script ne peut pas être exécuté en environnement de production."
    );
    console.error(
      "Utilisez l'option --force si vous êtes absolument sûr de vouloir modifier toutes les données de production."
    );

    // Vérifier si l'option --force est présente
    if (!process.argv.includes("--force")) {
      console.error("Opération annulée.");
      process.exit(1);
    }

    console.warn(
      "⚠️ Option --force détectée. Modification des données de production..."
    );
  }

  try {
    console.log("🖼️ Récupération de tous les restaurants...");

    // Récupérer tous les restaurants
    const restaurants = await prisma.restaurant.findMany();
    console.log(`📊 ${restaurants.length} restaurants trouvés.`);

    // Mettre à jour chaque restaurant avec une image
    let updatedCount = 0;
    for (const restaurant of restaurants) {
      // Sélectionner une image aléatoire dans notre liste
      const randomImage =
        restaurantImages[Math.floor(Math.random() * restaurantImages.length)];

      // Mettre à jour le restaurant
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          image: randomImage,
        },
      });

      updatedCount++;

      // Afficher la progression
      if (updatedCount % 10 === 0 || updatedCount === restaurants.length) {
        console.log(
          `✅ ${updatedCount}/${restaurants.length} restaurants mis à jour.`
        );
      }
    }

    return updatedCount;
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des images:", error);
    throw error;
  } finally {
    // Fermer la connexion Prisma
    await prisma.$disconnect();
  }
}

// Exécuter la fonction si le script est appelé directement
if (require.main === module) {
  updateRestaurantImages()
    .then((count) => {
      console.log(
        `📊 Opération terminée. ${count} restaurants mis à jour avec de nouvelles images.`
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

// Exporter la fonction pour pouvoir l'utiliser dans d'autres scripts
export default updateRestaurantImages;
