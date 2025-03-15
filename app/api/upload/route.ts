import { NextRequest, NextResponse } from "next/server";
import * as imageService from "@/app/lib/imageService";
import { UploadedFile } from "@/app/lib/types";
import { getUncachedImageUrl } from "@/app/components/utils";

export async function POST(request: NextRequest) {
  console.log("=== DÉBUT API UPLOAD ===");
  console.log(`API Upload: Requête reçue à ${new Date().toISOString()}`);
  console.log(`API Upload: URL: ${request.url}`);
  console.log(`API Upload: Méthode: ${request.method}`);
  console.log(
    `API Upload: Headers:`,
    Object.fromEntries(request.headers.entries())
  );

  try {
    const formData = await request.formData();
    // Convertir formData en tableau pour vérifier sa longueur
    const formDataEntries = Array.from(formData.entries());
    console.log(
      `API Upload: FormData reçu avec ${formDataEntries.length} entrées`
    );

    const image = formData.get("image") as File;
    const type = formData.get("type") as string;
    const uniqueId = (formData.get("uniqueId") as string) || "";

    console.log(
      `API Upload: Image reçue: ${image?.name || "non définie"}, taille: ${
        image?.size || 0
      } bytes`
    );
    console.log(`API Upload: Type: ${type || "non défini"}`);
    console.log(`API Upload: UniqueId: ${uniqueId || "non défini"}`);

    if (!image) {
      console.error("API Upload: Aucune image fournie");
      console.log("=== FIN API UPLOAD (ERREUR: PAS D'IMAGE) ===");
      return NextResponse.json(
        { error: "Aucune image fournie" },
        { status: 400 }
      );
    }

    if (!type) {
      console.error("API Upload: Aucun type fourni");
      console.log("=== FIN API UPLOAD (ERREUR: PAS DE TYPE) ===");
      return NextResponse.json({ error: "Aucun type fourni" }, { status: 400 });
    }

    // Créer un buffer à partir du fichier
    const buffer = Buffer.from(await image.arrayBuffer());

    // Générer un nom de fichier unique basé sur l'ID unique ou le nom original
    let originalname = image.name;

    // Si un uniqueId est fourni, préfixer le nom du fichier avec "user_" pour indiquer qu'il s'agit d'une image utilisateur
    if (uniqueId) {
      originalname = `user_${uniqueId}_${originalname}`;
      console.log(`API Upload: Nom de fichier avec ID unique: ${originalname}`);
    } else {
      // Si aucun uniqueId n'est fourni, ajouter quand même le préfixe "user_"
      originalname = `user_${Date.now()}_${originalname}`;
      console.log(`API Upload: Nom de fichier généré: ${originalname}`);
    }

    // Créer un objet UploadedFile pour le service d'image
    const uploadedFile: UploadedFile = {
      buffer,
      originalname,
      mimetype: image.type,
      size: image.size,
    };

    console.log(
      `API Upload: Appel du service d'image pour sauvegarder l'image`
    );
    const imageUrl = await imageService.saveImage(uploadedFile, type);
    console.log(`API Upload: URL de l'image sauvegardée: ${imageUrl}`);

    // Ajouter un timestamp à l'URL pour éviter les problèmes de cache
    const urlWithTimestamp = getUncachedImageUrl(imageUrl, true);
    console.log(`API Upload: URL avec timestamp: ${urlWithTimestamp}`);
    console.log("=== FIN API UPLOAD (SUCCÈS) ===");

    return NextResponse.json({ url: urlWithTimestamp });
  } catch (error) {
    console.error("API Upload: Erreur lors du traitement de l'image:", error);
    console.error(
      "API Upload: Détails de l'erreur:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("=== FIN API UPLOAD (ERREUR GÉNÉRALE) ===");

    return NextResponse.json(
      { error: "Erreur lors du traitement de l'image" },
      { status: 500 }
    );
  }
}
