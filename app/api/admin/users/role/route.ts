import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

// Route pour modifier le rôle d'un utilisateur
export async function PUT(request: Request) {
  try {
    // Vérifier l'authentification et les droits d'administrateur
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.role) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un administrateur
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const { userId, roleId } = await request.json();

    // Vérifier que tous les champs requis sont présents
    if (!userId || !roleId) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le rôle existe
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: "Rôle non trouvé" }, { status: 404 });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la modification du rôle:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la modification du rôle" },
      { status: 500 }
    );
  }
}

// Route pour récupérer tous les utilisateurs avec leurs rôles
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification et les droits d'administrateur
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.role) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un administrateur
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer tous les utilisateurs avec leurs rôles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la récupération des utilisateurs",
      },
      { status: 500 }
    );
  }
}
