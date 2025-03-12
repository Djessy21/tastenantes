import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Configurer SendGrid avec la clé API
// Vous devrez ajouter cette clé dans vos variables d'environnement
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn(
    "SENDGRID_API_KEY n'est pas définie. L'envoi d'emails ne fonctionnera pas."
  );
}

export async function POST(request: Request) {
  try {
    // Extraire les données du corps de la requête
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation des données
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    // Si la clé SendGrid n'est pas configurée, simuler un succès en développement
    if (!process.env.SENDGRID_API_KEY) {
      console.log("Mode simulation: SendGrid n'est pas configuré");
      console.log("Données du formulaire:", { name, email, subject, message });

      // En développement, on simule un succès
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "Email simulé avec succès (mode développement)",
        });
      } else {
        // En production, on renvoie une erreur
        return NextResponse.json(
          { error: "Configuration du service d'email manquante" },
          { status: 500 }
        );
      }
    }

    // Configurer le message email
    const msg = {
      to: "tastenantes@gmail.com", // L'adresse email de réception
      from: process.env.SENDGRID_FROM_EMAIL || "tastenantes@gmail.com", // L'adresse email d'envoi (doit être vérifiée dans SendGrid)
      subject: `[Contact Taste Nantes] ${subject}`,
      text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // Envoyer l'email
    await sgMail.send(msg);

    // Répondre avec succès
    return NextResponse.json({
      success: true,
      message: "Votre message a été envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);

    // Répondre avec une erreur
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
