import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export async function saveImage(
  file: UploadedFile,
  type: string
): Promise<string> {
  try {
    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), "public", "uploads", type);
    await fs.mkdir(uploadsDir, { recursive: true });

    // Générer un nom de fichier unique
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
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
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error("Failed to save image");
  }
}

export const imageService = {
  async deleteImage(imageUrl: string) {
    const filename = path.basename(imageUrl);
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  },
};
