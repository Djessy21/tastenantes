import path from "path";
import fs from "fs/promises";

// Import sharp uniquement en développement
let sharp: any;
if (process.env.NODE_ENV === "development") {
  import("sharp").then((module) => {
    sharp = module.default;
  });
}

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

// Assurer que le dossier uploads existe
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveImage(
  file: UploadedFile,
  type: string
): Promise<string> {
  try {
    console.log("=== DÉBUT IMAGE SERVICE SAVE IMAGE ===");
    console.log(
      `ImageService: Début du traitement de l'image de type: ${type}`
    );
    console.log(
      `ImageService: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}, Vercel Env: ${process.env.VERCEL_ENV}`
    );
    console.log(
      `ImageService: Taille du buffer: ${file.buffer.length} bytes, nom: ${file.originalname}, type MIME: ${file.mimetype}`
    );

    // Vérifier que le buffer n'est pas vide
    if (!file.buffer || file.buffer.length === 0) {
      console.error("ImageService: Buffer d'image vide");
      console.log("=== FIN IMAGE SERVICE SAVE IMAGE (BUFFER VIDE) ===");
      // Retourner une image par défaut
      if (type === "restaurant") {
        return `/default-restaurant.svg`;
      } else if (type === "dish") {
        return `/default-dish.svg`;
      } else {
        return `/default-image.svg`;
      }
    }

    // Créer le dossier uploads s'il n'existe pas
    await ensureUploadDir();

    // En environnement de développement, stocker l'image sur le système de fichiers
    console.log(
      `ImageService: Stockage de l'image sur le système de fichiers local`
    );

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), "public", "uploads", type);
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log(`ImageService: Dossier d'upload créé/vérifié: ${uploadsDir}`);

    // Vérifier si le nom de fichier contient des préfixes spéciaux
    const isUserImage = file.originalname.startsWith("user_");
    const isTestImage =
      file.originalname.includes("unsplash") ||
      file.originalname.includes("test_") ||
      file.originalname.includes("seed_");

    // Utiliser le nom de fichier original qui peut déjà contenir un identifiant unique
    // ou générer un nom de fichier unique si nécessaire
    let filename;
    if (isUserImage) {
      // Pour les images utilisateur, conserver le préfixe user_ et ajouter un timestamp
      filename = file.originalname.replace(/\s+/g, "-");
      console.log(
        `ImageService: Utilisation du nom de fichier utilisateur: ${filename}`
      );
    } else if (isTestImage) {
      // Pour les images de test, ajouter un préfixe test_ pour les identifier clairement
      const cleanName = file.originalname.replace(/\s+/g, "-");
      filename = `test_${Date.now()}_${cleanName}`;
      console.log(
        `ImageService: Image de test détectée, nom généré: ${filename}`
      );
    } else {
      // Pour les autres images, générer un nom unique avec un timestamp
      filename = `${Date.now()}_${file.originalname.replace(/\s+/g, "-")}`;
      console.log(
        `ImageService: Nom de fichier généré avec timestamp: ${filename}`
      );
    }

    const filepath = path.join(uploadsDir, filename);
    console.log(`ImageService: Chemin du fichier: ${filepath}`);

    // Optimiser et sauvegarder l'image
    if (!sharp) {
      console.log(
        `ImageService: Sharp n'est pas disponible, sauvegarde directe du buffer`
      );
      // Convertir le Buffer en Uint8Array pour éviter les problèmes de type
      await fs.writeFile(filepath, new Uint8Array(file.buffer));
      console.log(`ImageService: Fichier sauvegardé directement: ${filepath}`);
    } else {
      console.log(`ImageService: Optimisation de l'image avec Sharp`);

      // Paramètres d'optimisation différents selon le type d'image
      if (isUserImage) {
        // Pour les images utilisateur, optimiser avec une meilleure qualité
        await sharp(file.buffer)
          .resize(1200, 800, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toFile(filepath);
        console.log(
          `ImageService: Image utilisateur optimisée et sauvegardée: ${filepath}`
        );
      } else {
        // Pour les autres images, utiliser des paramètres standard
        await sharp(file.buffer)
          .resize(800, 600, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toFile(filepath);
        console.log(
          `ImageService: Image optimisée et sauvegardée: ${filepath}`
        );
      }
    }

    // Retourner l'URL relative pour l'accès via le navigateur
    const imageUrl = `/uploads/${type}/${filename}`;
    console.log(`ImageService: URL de l'image générée: ${imageUrl}`);
    console.log("=== FIN IMAGE SERVICE SAVE IMAGE (SUCCÈS) ===");
    return imageUrl;
  } catch (error) {
    console.error(
      "ImageService: Erreur générale lors du traitement de l'image:",
      error
    );
    console.error(
      "ImageService: Détails de l'erreur:",
      error instanceof Error ? error.message : String(error)
    );
    // En cas d'erreur, retourner une image statique
    console.log(
      `ImageService: Utilisation d'une image statique par défaut pour le type: ${type} (après erreur générale)`
    );
    console.log("=== FIN IMAGE SERVICE SAVE IMAGE (ERREUR GÉNÉRALE) ===");
    if (type === "restaurant") {
      return `/default-restaurant.svg`;
    } else if (type === "dish") {
      return `/default-dish.svg`;
    } else {
      return `/default-image.svg`;
    }
  }
}

export const imageService = {
  async deleteImage(imageUrl: string) {
    console.log("=== DÉBUT IMAGE SERVICE DELETE IMAGE ===");
    console.log(
      `ImageService: Tentative de suppression de l'image: ${imageUrl}`
    );
    console.log(
      `ImageService: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}`
    );

    // Ne pas essayer de supprimer des images en production
    if (process.env.NODE_ENV === "production") {
      console.log("ImageService: Suppression d'image désactivée en production");
      console.log("=== FIN IMAGE SERVICE DELETE IMAGE (PRODUCTION) ===");
      return;
    }

    // Ne pas essayer de supprimer des images statiques par défaut
    if (
      imageUrl === "/default-restaurant.svg" ||
      imageUrl === "/default-dish.svg" ||
      imageUrl === "/default-image.svg"
    ) {
      console.log(
        `ImageService: Tentative de suppression d'une image par défaut: ${imageUrl}`
      );
      console.log("=== FIN IMAGE SERVICE DELETE IMAGE (IMAGE PAR DÉFAUT) ===");
      return;
    }

    try {
      // Extraire le chemin relatif de l'URL
      const relativePath = imageUrl.startsWith("/uploads/")
        ? imageUrl.substring(1) // Enlever le slash initial
        : imageUrl;

      // Nettoyer l'URL en supprimant les paramètres de requête
      const cleanPath = relativePath.split("?")[0];
      console.log(`ImageService: Chemin relatif nettoyé: ${cleanPath}`);

      const filePath = path.join(process.cwd(), "public", cleanPath);
      console.log(`ImageService: Chemin absolu du fichier: ${filePath}`);

      // Vérifier si le fichier existe
      try {
        await fs.access(filePath);
        console.log(`ImageService: Le fichier existe: ${filePath}`);
      } catch (accessError) {
        console.error(`ImageService: Le fichier n'existe pas: ${filePath}`);
        console.error(
          "ImageService: Détails de l'erreur d'accès:",
          accessError instanceof Error
            ? accessError.message
            : String(accessError)
        );
        console.log(
          "=== FIN IMAGE SERVICE DELETE IMAGE (FICHIER INEXISTANT) ==="
        );
        return;
      }

      // Supprimer le fichier
      await fs.unlink(filePath);
      console.log(`ImageService: Fichier supprimé avec succès: ${filePath}`);
      console.log("=== FIN IMAGE SERVICE DELETE IMAGE (SUCCÈS) ===");
    } catch (error) {
      console.error(
        "ImageService: Erreur lors de la suppression de l'image:",
        error
      );
      console.error(
        "ImageService: Détails de l'erreur:",
        error instanceof Error ? error.message : String(error)
      );
      console.log("=== FIN IMAGE SERVICE DELETE IMAGE (ERREUR) ===");
    }
  },
};
