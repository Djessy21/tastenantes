import { NextRequest, NextResponse } from "next/server";
import * as imageService from "@/app/lib/imageService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const type = formData.get("type") as string | null;

    if (!image || !type) {
      return NextResponse.json(
        { error: "Image and type are required" },
        { status: 400 }
      );
    }

    // En environnement de production, utiliser directement les images statiques
    if (process.env.NODE_ENV === "production") {
      console.log(
        `API Upload: Utilisation d'une image statique pour le type: ${type} (production)`
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

    try {
      const buffer = Buffer.from(await image.arrayBuffer());
      const imageUrl = await imageService.saveImage(
        {
          buffer,
          originalname: image.name,
          mimetype: image.type,
          size: image.size,
        },
        type
      );

      return NextResponse.json({ imageUrl });
    } catch (imageError) {
      console.error("Error processing image:", imageError);

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
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Error uploading image" },
      { status: 500 }
    );
  }
}
