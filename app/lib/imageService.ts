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
    // En environnement de production ou si sharp n'est pas disponible
    if (process.env.NODE_ENV === "production" || !sharp) {
      console.log(`Utilisation d'une image statique pour le type: ${type}`);
      // Utiliser des images statiques hébergées dans le projet
      if (type === "restaurant") {
        return `/default-restaurant.svg`;
      } else if (type === "dish") {
        return `/default-dish.svg`;
      } else {
        return `/default-image.svg`;
      }
    } else {
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

      // Optimiser et sauvegarder l'image
      await sharp(file.buffer)
        .resize(800, 600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toFile(filepath);

      // Retourner l'URL relative pour l'accès via le navigateur
      return `/uploads/${type}/${filename}`;
    }
  } catch (error) {
    console.error("Error saving image:", error);
    // En cas d'erreur, retourner une image statique
    console.log(
      `Utilisation d'une image statique par défaut pour le type: ${type} (après erreur)`
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
