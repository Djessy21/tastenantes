import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Vérifier que tous les champs requis sont présents
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    // Vérifier que le mot de passe est suffisamment fort
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cette adresse email existe déjà" },
        { status: 409 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: "user", // Rôle par défaut
      },
    });

    // Retourner l'utilisateur créé (sans le mot de passe)
    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "user",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
