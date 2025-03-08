import path from "path";
import fs from "fs/promises";
import { storeBinaryImage } from "./db-edge";

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
    console.log(
      `ImageService: Début du traitement de l'image de type: ${type}`
    );
    console.log(
      `ImageService: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}, Vercel Env: ${process.env.VERCEL_ENV}`
    );
    console.log(
      `ImageService: Taille du buffer: ${file.buffer.length} bytes, nom: ${file.originalname}, type MIME: ${file.mimetype}`
    );

    // En environnement de production, stocker l'image dans la base de données
    if (process.env.NODE_ENV === "production") {
      console.log(
        `ImageService: Stockage de l'image dans la base de données pour le type: ${type}`
      );

      try {
        // Optimiser l'image avant de la stocker si sharp est disponible
        let imageBuffer = file.buffer;

        // Stocker l'image dans la base de données
        console.log(
          `ImageService: Appel de storeBinaryImage avec un buffer de ${imageBuffer.length} bytes`
        );
        const imageId = await storeBinaryImage(
          imageBuffer,
          type,
          file.mimetype,
          file.originalname
        );

        console.log(`ImageService: Image stockée avec succès, ID: ${imageId}`);

        // Retourner l'URL de l'API qui servira l'image
        const imageUrl = `/api/images/${imageId}`;
        console.log(`ImageService: URL de l'image générée: ${imageUrl}`);
        return imageUrl;
      } catch (dbError) {
        console.error(
          "ImageService: Erreur lors du stockage de l'image dans la base de données:",
          dbError
        );
        // En cas d'erreur, utiliser une image statique
        console.log(
          `ImageService: Utilisation d'une image statique pour le type: ${type} (après erreur DB)`
        );
        if (type === "restaurant") {
          return `/default-restaurant.svg`;
        } else if (type === "dish") {
          return `/default-dish.svg`;
        } else {
          return `/default-image.svg`;
        }
      }
    } else {
      console.log(
        `ImageService: Stockage de l'image sur le système de fichiers local`
      );
      // En développement avec sharp disponible
      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = path.join(process.cwd(), "public", "uploads", type);
      await fs.mkdir(uploadsDir, { recursive: true });

      // Générer un nom de fichier unique
      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const filepath = path.join(uploadsDir, filename);

      console.log(`ImageService: Chemin du fichier: ${filepath}`);

      // Optimiser et sauvegarder l'image
      if (!sharp) {
        console.log(
          `ImageService: Sharp n'est pas disponible, sauvegarde directe du buffer`
        );
        await fs.writeFile(filepath, file.buffer);
      } else {
        console.log(`ImageService: Optimisation de l'image avec Sharp`);
        await sharp(file.buffer)
          .resize(800, 600, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toFile(filepath);
      }

      // Retourner l'URL relative pour l'accès via le navigateur
      const imageUrl = `/uploads/${type}/${filename}`;
      console.log(`ImageService: URL de l'image générée: ${imageUrl}`);
      return imageUrl;
    }
  } catch (error) {
    console.error(
      "ImageService: Erreur générale lors du traitement de l'image:",
      error
    );
    // En cas d'erreur, retourner une image statique
    console.log(
      `ImageService: Utilisation d'une image statique par défaut pour le type: ${type} (après erreur générale)`
    );
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
    // Ne pas essayer de supprimer des images en production
    if (process.env.NODE_ENV === "production") {
      return;
    }

    // Ne pas essayer de supprimer des images statiques par défaut
    if (
      imageUrl === "/default-restaurant.svg" ||
      imageUrl === "/default-dish.svg" ||
      imageUrl === "/default-image.svg"
    ) {
      return;
    }

    try {
      const filename = path.basename(imageUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  },
};
