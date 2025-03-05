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
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Error uploading image" },
      { status: 500 }
    );
  }
}
