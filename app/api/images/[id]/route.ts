import { NextRequest, NextResponse } from "next/server";
import { getBinaryImageById } from "@/app/lib/db-edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new NextResponse("Invalid image ID", { status: 400 });
    }

    const image = await getBinaryImageById(id);
    if (!image) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Convertir les données binaires en Buffer si nécessaire
    const imageBuffer = Buffer.isBuffer(image.image_data)
      ? image.image_data
      : Buffer.from(image.image_data);

    // Retourner l'image avec le bon type MIME
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": image.mime_type,
        "Content-Disposition": `inline; filename="${image.filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache pendant 1 an
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
