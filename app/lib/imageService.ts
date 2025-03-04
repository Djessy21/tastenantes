import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

// Assurer que le dossier uploads existe
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export const imageService = {
  async saveImage(
    file: Express.Multer.File,
    type: "restaurant" | "dish"
  ): Promise<string> {
    await ensureUploadDir();

    const filename = `${type}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(file.buffer)
      .resize(type === "restaurant" ? 800 : 400)
      .webp({ quality: 80 })
      .toFile(outputPath);

    return `/uploads/${filename}`;
  },

  async deleteImage(imageUrl: string) {
    const filename = path.basename(imageUrl);
    const filePath = path.join(UPLOAD_DIR, filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  },
};
