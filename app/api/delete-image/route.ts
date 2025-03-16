import { NextRequest, NextResponse } from "next/server";
import { imageService } from "@/app/lib/imageService";

export async function DELETE(request: NextRequest) {
  try {
    console.log("=== DÉBUT API DELETE IMAGE ===");
    console.log("API Delete Image: Début du traitement de la requête");
    console.log(`API Delete Image: URL complète: ${request.url}`);
    console.log(
      `API Delete Image: Headers: ${JSON.stringify(
        Object.fromEntries(request.headers)
      )}`
    );

    // Récupérer l'URL de l'image à supprimer depuis les paramètres de requête
    const url = request.nextUrl.searchParams.get("url");
    console.log(`API Delete Image: URL demandée pour suppression: ${url}`);

    if (!url) {
      console.log("API Delete Image: URL manquante");
      console.log("=== FIN API DELETE IMAGE (ERREUR: URL MANQUANTE) ===");
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log(
      `API Delete Image: Tentative de suppression de l'image: ${url}`
    );
    console.log(
      `API Delete Image: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}`
    );

    // Supprimer l'image
    await imageService.deleteImage(url);

    console.log(`API Delete Image: Image supprimée avec succès: ${url}`);
    console.log("=== FIN API DELETE IMAGE (SUCCÈS) ===");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "API Delete Image: Erreur lors de la suppression de l'image:",
      error
    );
    console.error(
      "API Delete Image: Détails de l'erreur:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("=== FIN API DELETE IMAGE (ERREUR GÉNÉRALE) ===");
    return NextResponse.json(
      { error: "Error deleting image" },
      { status: 500 }
    );
  }
}
