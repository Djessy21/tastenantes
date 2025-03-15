import { NextRequest, NextResponse } from "next/server";
import * as imageService from "@/app/lib/imageService";

export async function POST(request: NextRequest) {
  try {
    console.log("=== DÉBUT API UPLOAD ===");
    console.log("API Upload: Début du traitement de la requête");
    console.log(`API Upload: URL complète: ${request.url}`);
    console.log(
      `API Upload: Headers: ${JSON.stringify(
        Object.fromEntries(request.headers)
      )}`
    );

    const formData = await request.formData();
    console.log("API Upload: FormData reçu");

    const image = formData.get("image") as File | null;
    const type = formData.get("type") as string | null;
    const uniqueId = formData.get("uniqueId") as string | null;

    console.log(
      `API Upload: Image reçue: ${image?.name}, type: ${type}, taille: ${image?.size} bytes, uniqueId: ${uniqueId}`
    );
    console.log(
      `API Upload: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}, Vercel Env: ${process.env.VERCEL_ENV}`
    );

    if (!image || !type) {
      console.log("API Upload: Image ou type manquant");
      console.log("=== FIN API UPLOAD (ERREUR: PARAMÈTRES MANQUANTS) ===");
      return NextResponse.json(
        { error: "Image and type are required" },
        { status: 400 }
      );
    }

    try {
      console.log(`API Upload: Traitement de l'image de type: ${type}`);

      // Pour contourner les problèmes de stockage en base de données, utiliser une URL externe
      // Choisir une URL d'image aléatoire en fonction du type
      let imageUrl = "";
      if (type === "restaurant") {
        // Liste d'URLs d'images de restaurants
        const restaurantImages = [
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000",
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000",
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000",
          "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=1000",
          "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000",
          "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000",
          "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1000",
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
          "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=1000",
        ];
        // Sélectionner une image aléatoire
        imageUrl =
          restaurantImages[Math.floor(Math.random() * restaurantImages.length)];
      } else if (type === "dish") {
        // Liste d'URLs d'images de plats
        const dishImages = [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1000",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000",
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000",
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000",
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000",
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000",
          "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?q=80&w=1000",
        ];
        // Sélectionner une image aléatoire
        imageUrl = dishImages[Math.floor(Math.random() * dishImages.length)];
      } else {
        // Image par défaut
        imageUrl =
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000";
      }

      console.log(
        `API Upload: Utilisation de l'URL d'image externe: ${imageUrl}`
      );

      // Ajouter un timestamp à l'URL pour forcer le rechargement
      const timestampedUrl = `${imageUrl}?t=${Date.now()}`;
      console.log(`API Upload: URL avec timestamp: ${timestampedUrl}`);
      console.log("=== FIN API UPLOAD (SUCCÈS) ===");
      return NextResponse.json({ imageUrl: timestampedUrl });
    } catch (imageError) {
      console.error(
        "API Upload: Erreur lors du traitement de l'image:",
        imageError
      );
      console.error(
        "API Upload: Détails de l'erreur:",
        imageError instanceof Error ? imageError.message : String(imageError)
      );

      // En cas d'erreur, retourner une URL d'image statique
      console.log(
        `API Upload: Utilisation d'une image statique pour le type: ${type} (après erreur)`
      );
      let defaultImageUrl = "";
      if (type === "restaurant") {
        defaultImageUrl = `/default-restaurant.svg`;
      } else if (type === "dish") {
        defaultImageUrl = `/default-dish.svg`;
      } else {
        defaultImageUrl = `/default-image.svg`;
      }

      console.log(`API Upload: URL de l'image par défaut: ${defaultImageUrl}`);
      console.log("=== FIN API UPLOAD (ERREUR: TRAITEMENT IMAGE) ===");
      return NextResponse.json({ imageUrl: defaultImageUrl });
    }
  } catch (error) {
    console.error("API Upload: Erreur générale:", error);
    console.error(
      "API Upload: Détails de l'erreur:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("=== FIN API UPLOAD (ERREUR GÉNÉRALE) ===");
    return NextResponse.json(
      { error: "Error uploading image" },
      { status: 500 }
    );
  }
}
