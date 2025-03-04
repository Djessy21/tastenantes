import { NextRequest, NextResponse } from "next/server";
import { imageService } from "../../lib/imageService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const type =
      (formData.get("type") as "restaurant" | "dish") || "restaurant";

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const imageUrl = await imageService.saveImage(
      { buffer } as Express.Multer.File,
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
