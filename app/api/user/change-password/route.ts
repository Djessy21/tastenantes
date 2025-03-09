import { NextResponse } from "next/server";
import { hash, compare } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les données de la requête
    const { currentPassword, newPassword } = await request.json();

    // Vérifier que les données nécessaires sont présentes
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Les mots de passe actuels et nouveaux sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le nouveau mot de passe est suffisamment fort
    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error: "Le nouveau mot de passe doit contenir au moins 8 caractères",
        },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 400 }
      );
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Mot de passe mis à jour avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}
