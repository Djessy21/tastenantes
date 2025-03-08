import { NextResponse } from "next/server";
import { initDB } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function POST() {
  try {
    await initDB();
    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
