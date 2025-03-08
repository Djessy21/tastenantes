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

      // En cas d'erreur, retourner une URL de placeholder
      let placeholderUrl = "";
      if (type === "restaurant") {
        placeholderUrl = "https://placehold.co/800x600/png?text=Restaurant";
      } else if (type === "dish") {
        placeholderUrl = "https://placehold.co/400x300/png?text=Plat";
      } else {
        placeholderUrl = `https://placehold.co/600x400/png?text=${encodeURIComponent(
          type
        )}`;
      }

      return NextResponse.json({ imageUrl: placeholderUrl });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Error uploading image" },
      { status: 500 }
    );
  }
}
