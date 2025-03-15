/**
 * Script pour mettre à jour les images des restaurants sans images ou avec des images par défaut
 *
 * Utilisation:
 * npm run update-images
 *
 * Ce script met à jour les images des restaurants dans la base de données
 * qui n'ont pas d'image ou qui ont une image par défaut, en leur attribuant
 * une URL d'image valide depuis Unsplash.
 *
 * IMPORTANT: Ce script ne remplace PAS les images téléchargées par les utilisateurs.
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

/**
 * Vérifie si une image est une image utilisateur
 * @param imageUrl L'URL de l'image à vérifier
 * @returns true si c'est une image utilisateur, false sinon
 */
function isUserImage(imageUrl: string | null): boolean {
  if (!imageUrl) return false;

  // Les images utilisateur sont stockées dans le dossier uploads
  // ou commencent par "user_"
  return imageUrl.includes("/uploads/") || imageUrl.includes("user_");
}

/**
 * Vérifie si une image est une image par défaut ou manquante
 * @param imageUrl L'URL de l'image à vérifier
 * @returns true si c'est une image par défaut ou manquante, false sinon
 */
function isDefaultOrMissingImage(imageUrl: string | null): boolean {
  if (!imageUrl) return true;

  return (
    imageUrl.includes("default-") ||
    imageUrl === "" ||
    imageUrl.includes("placeholder")
  );
}

async function updateRestaurantImages() {
  // Afficher l'environnement actuel
  const env = getEnvironment();
  console.log(`🌍 Environnement détecté: ${env}`);

  try {
    console.log("🖼️ Récupération de tous les restaurants...");

    // Récupérer tous les restaurants
    const restaurants = await prisma.restaurant.findMany();
    console.log(`📊 ${restaurants.length} restaurants trouvés.`);

    // Mettre à jour uniquement les restaurants sans image ou avec une image par défaut
    let updatedCount = 0;
    let skippedCount = 0;

    for (const restaurant of restaurants) {
      // Vérifier si l'image est une image utilisateur
      if (isUserImage(restaurant.image)) {
        console.log(
          `⏭️ Restaurant ${restaurant.id} (${restaurant.name}) ignoré: image utilisateur détectée.`
        );
        skippedCount++;
        continue;
      }

      // Vérifier si l'image est une image par défaut ou manquante
      if (isDefaultOrMissingImage(restaurant.image)) {
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

        console.log(
          `✅ Restaurant ${restaurant.id} (${restaurant.name}) mis à jour avec une nouvelle image.`
        );
        updatedCount++;
      } else {
        console.log(
          `⏭️ Restaurant ${restaurant.id} (${restaurant.name}) ignoré: image existante.`
        );
        skippedCount++;
      }

      // Afficher la progression
      if (
        (updatedCount + skippedCount) % 10 === 0 ||
        updatedCount + skippedCount === restaurants.length
      ) {
        console.log(
          `📊 Progression: ${updatedCount + skippedCount}/${
            restaurants.length
          } restaurants traités (${updatedCount} mis à jour, ${skippedCount} ignorés).`
        );
      }
    }

    return { updatedCount, skippedCount };
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
    .then((result) => {
      console.log(
        `📊 Opération terminée. ${result.updatedCount} restaurants mis à jour avec de nouvelles images, ${result.skippedCount} restaurants ignorés.`
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
