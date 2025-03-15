import React from "react";
import AccentDemo from "../components/AccentDemo";

export const metadata = {
  title: "Démonstration des couleurs d'accentuation | Taste Nantes",
  description:
    "Découvrez comment utiliser les couleurs d'accentuation dans l'application Taste Nantes.",
};

export default function AccentDemoPage() {
  return (
    <div className="pt-16 pb-32 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <AccentDemo />
    </div>
  );
}
