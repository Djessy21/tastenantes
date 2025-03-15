import { NextRequest, NextResponse } from "next/server";
import { getImageFromDatabase } from "@/app/lib/imageService";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== DÉBUT API IMAGES ===");
    console.log(`API Images: Requête pour l'image avec l'ID ${params.id}`);
    console.log(`API Images: URL complète: ${request.url}`);
    console.log(
      `API Images: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}`
    );

    const id = parseInt(params.id);

    if (isNaN(id)) {
      console.error("API Images: ID d'image invalide");
      console.log("=== FIN API IMAGES (ERREUR: ID INVALIDE) ===");
      return new NextResponse("Invalid image ID", { status: 400 });
    }

    // Récupérer l'image depuis la base de données
    const image = await getImageFromDatabase(id);

    if (!image) {
      console.error("API Images: Image non trouvée dans la base de données");
      console.log("=== FIN API IMAGES (ERREUR: IMAGE NON TROUVÉE) ===");
      return new NextResponse("Image not found", { status: 404 });
    }

    console.log(
      `API Images: Image récupérée, taille: ${image.buffer.length} bytes, type: ${image.mimeType}`
    );
    console.log("=== FIN API IMAGES (SUCCÈS) ===");

    // Retourner l'image avec le bon type MIME
    return new NextResponse(image.buffer, {
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(
      "API Images: Erreur lors de la récupération de l'image:",
      error
    );
    console.error(
      "API Images: Détails de l'erreur:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("=== FIN API IMAGES (ERREUR GÉNÉRALE) ===");

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
