import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
      include: { role: true },
    });

    if (!user || user.role.id !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Récupérer tous les messages de contact, triés par date de création (les plus récents d'abord)
    const messages = await prisma.$queryRaw`
      SELECT * FROM contact_messages
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des messages" },
      { status: 500 }
    );
  }
}
