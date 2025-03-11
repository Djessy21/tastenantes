import { NextRequest, NextResponse } from "next/server";
import { getBinaryImageById } from "@/app/lib/db-edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      `API Images: Début du traitement de la requête pour l'ID: ${params.id}`
    );

    const id = parseInt(params.id);
    if (isNaN(id)) {
      console.log(`API Images: ID invalide: ${params.id}`);
      return new NextResponse("Invalid image ID", { status: 400 });
    }

    console.log(`API Images: Récupération de l'image avec l'ID: ${id}`);
    const image = await getBinaryImageById(id);
    if (!image) {
      console.log(`API Images: Image non trouvée pour l'ID: ${id}`);
      return new NextResponse("Image not found", { status: 404 });
    }

    console.log(
      `API Images: Image trouvée, MIME: ${image.mime_type}, nom: ${image.filename}, taille: ${image.image_data.length} bytes`
    );

    // Convertir les données binaires en Buffer si nécessaire
    const imageBuffer = Buffer.isBuffer(image.image_data)
      ? image.image_data
      : Buffer.from(image.image_data);

    console.log(
      `API Images: Envoi de l'image au client, taille du buffer: ${imageBuffer.length} bytes`
    );

    // Nettoyer le nom du fichier pour éviter les problèmes avec les caractères spéciaux
    const cleanFilename = image.filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^\x00-\x7F]/g, "") // Supprimer les caractères non-ASCII
      .replace(/[']/g, "'") // Remplacer les apostrophes typographiques par des apostrophes simples
      .replace(/[^a-zA-Z0-9.-]/g, "_"); // Remplacer les autres caractères spéciaux par des underscores

    try {
      // Retourner l'image avec le bon type MIME
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": image.mime_type,
          "Content-Disposition": `inline; filename="${cleanFilename}"`,
          "Cache-Control": "public, max-age=31536000, immutable", // Cache pendant 1 an
        },
      });
    } catch (responseError) {
      console.error(
        "API Images: Erreur lors de la création de la réponse:",
        responseError
      );

      // En cas d'erreur avec le nom du fichier, essayer avec un nom générique
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": image.mime_type,
          "Content-Disposition": `inline; filename="image-${id}.${
            image.mime_type.split("/")[1] || "jpg"
          }"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (error) {
    console.error("API Images: Erreur lors du service de l'image:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
