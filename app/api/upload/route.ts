import { NextRequest, NextResponse } from "next/server";
import * as imageService from "@/app/lib/imageService";

export async function POST(request: NextRequest) {
  try {
    console.log("API Upload: Début du traitement de la requête");
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const type = formData.get("type") as string | null;

    console.log(
      `API Upload: Image reçue: ${image?.name}, type: ${type}, taille: ${image?.size} bytes`
    );
    console.log(
      `API Upload: Environnement: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}, Vercel Env: ${process.env.VERCEL_ENV}`
    );

    if (!image || !type) {
      console.log("API Upload: Image ou type manquant");
      return NextResponse.json(
        { error: "Image and type are required" },
        { status: 400 }
      );
    }

    try {
      console.log(`API Upload: Traitement de l'image de type: ${type}`);
      const buffer = Buffer.from(await image.arrayBuffer());
      console.log(`API Upload: Buffer créé, taille: ${buffer.length} bytes`);

      const imageUrl = await imageService.saveImage(
        {
          buffer,
          originalname: image.name,
          mimetype: image.type,
          size: image.size,
        },
        type
      );

      console.log(`API Upload: Image traitée avec succès, URL: ${imageUrl}`);
      return NextResponse.json({ imageUrl });
    } catch (imageError) {
      console.error(
        "API Upload: Erreur lors du traitement de l'image:",
        imageError
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

      return NextResponse.json({ imageUrl: defaultImageUrl });
    }
  } catch (error) {
    console.error("API Upload: Erreur générale:", error);
    return NextResponse.json(
      { error: "Error uploading image" },
      { status: 500 }
    );
  }
}
