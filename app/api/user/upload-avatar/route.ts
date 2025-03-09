import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer le fichier de la requête
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Type de fichier non pris en charge. Utilisez JPG, PNG ou WebP.",
        },
        { status: 400 }
      );
    }

    // Lire le contenu du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer le répertoire d'uploads s'il n'existe pas
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await createDirIfNotExists(uploadDir);

    // Générer un nom de fichier unique
    const uniqueId = uuidv4();
    const extension = file.type.split("/")[1];
    const filename = `avatar-${uniqueId}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    // Redimensionner et optimiser l'image
    await sharp(buffer).resize(200, 200, { fit: "cover" }).toFile(filePath);

    // Mettre à jour l'URL de l'image de l'utilisateur
    const imageUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'upload de l'avatar:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload de l'avatar" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour créer un répertoire s'il n'existe pas
async function createDirIfNotExists(dir: string) {
  try {
    await writeFile(path.join(dir, ".gitkeep"), "", { flag: "wx" });
  } catch (error: any) {
    // Ignorer l'erreur si le fichier existe déjà
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}
