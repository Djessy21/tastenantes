import { NextRequest, NextResponse } from "next/server";
import { getImageFromTempStorage } from "@/app/lib/imageService";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; filename: string } }
) {
  try {
    console.log("=== DÉBUT API IMAGES ===");
    console.log(`API Images: Requête pour ${params.type}/${params.filename}`);
    console.log(`API Images: URL complète: ${request.url}`);
    console.log(
      `API Images: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}`
    );

    const { type, filename } = params;

    // Vérifier si nous sommes sur Vercel en production
    if (process.env.VERCEL === "1" && process.env.NODE_ENV === "production") {
      console.log(
        "API Images: Récupération de l'image depuis le stockage temporaire"
      );

      // Récupérer l'image depuis le stockage temporaire
      const buffer = await getImageFromTempStorage(type, filename);

      if (!buffer) {
        console.error(
          "API Images: Image non trouvée dans le stockage temporaire"
        );
        console.log("=== FIN API IMAGES (ERREUR: IMAGE NON TROUVÉE) ===");
        return new NextResponse("Image not found", { status: 404 });
      }

      console.log(
        `API Images: Image récupérée, taille: ${buffer.length} bytes`
      );

      // Déterminer le type MIME en fonction de l'extension du fichier
      const ext = path.extname(filename).toLowerCase();
      let contentType = "image/jpeg"; // Par défaut

      if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".svg") contentType = "image/svg+xml";

      console.log(`API Images: Type MIME déterminé: ${contentType}`);
      console.log("=== FIN API IMAGES (SUCCÈS) ===");

      // Retourner l'image avec le bon type MIME
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } else {
      // En développement, rediriger vers le fichier statique
      console.log("API Images: Redirection vers le fichier statique");
      const staticUrl = `/uploads/${type}/${filename}`;
      console.log(`API Images: URL statique: ${staticUrl}`);
      console.log("=== FIN API IMAGES (REDIRECTION) ===");

      return NextResponse.redirect(new URL(staticUrl, request.url));
    }
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
