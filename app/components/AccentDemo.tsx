"use client";

import React from "react";
import AccentButton from "./AccentButton";
import { motion } from "framer-motion";

const AccentDemo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-semibold mb-8 text-[#5D4D40]">
        Démonstration des couleurs d'accentuation
      </h2>

      <div className="mb-10">
        <h3 className="text-xl font-medium mb-4 text-[#5D4D40]">
          Palette de couleurs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch
            color="#7D9D74"
            name="Accent"
            variable="--color-accent"
          />
          <ColorSwatch
            color="#5C7A53"
            name="Accent Dark"
            variable="--color-accent-dark"
          />
          <ColorSwatch
            color="#A3BF9B"
            name="Accent Light"
            variable="--color-accent-light"
          />
          <ColorSwatch
            color="#E1EBD9"
            name="Accent Lighter"
            variable="--color-accent-lighter"
          />
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-medium mb-4 text-[#5D4D40]">
          Boutons d'accentuation
        </h3>
        <div className="flex flex-wrap gap-4">
          <AccentButton variant="solid">Bouton principal</AccentButton>
          <AccentButton variant="outline">Bouton contour</AccentButton>
          <AccentButton variant="light">Bouton léger</AccentButton>
          <AccentButton variant="solid" disabled>
            Bouton désactivé
          </AccentButton>
          <AccentButton
            variant="solid"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          >
            Avec icône
          </AccentButton>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-medium mb-4 text-[#5D4D40]">
          Cartes avec accentuation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-[#E8E1D9] shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E1EBD9] flex items-center justify-center text-[#7D9D74]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="ml-3 text-lg font-medium text-[#5D4D40]">
                Carte standard
              </h4>
            </div>
            <p className="text-[#8C7B6B] mb-4">
              Cette carte utilise la couleur d'accentuation pour l'icône.
            </p>
            <AccentButton variant="outline" size="sm">
              En savoir plus
            </AccentButton>
          </div>

          <div className="p-6 rounded-lg border border-[#7D9D74] shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#7D9D74] flex items-center justify-center text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="ml-3 text-lg font-medium text-[#5D4D40]">
                Carte premium
              </h4>
            </div>
            <p className="text-[#8C7B6B] mb-4">
              Cette carte utilise la couleur d'accentuation pour la bordure et
              l'icône.
            </p>
            <AccentButton variant="solid" size="sm">
              En savoir plus
            </AccentButton>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-medium mb-4 text-[#5D4D40]">
          Badges et étiquettes
        </h3>
        <div className="flex flex-wrap gap-3">
          <span className="px-2 py-1 text-xs rounded-full bg-[#E1EBD9] text-[#5C7A53]">
            Nouveau
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-[#7D9D74] text-white">
            Populaire
          </span>
          <span className="px-2 py-1 text-xs rounded-full border border-[#7D9D74] text-[#7D9D74]">
            Exclusif
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-[#A3BF9B] text-white">
            Recommandé
          </span>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-medium mb-4 text-[#5D4D40]">
          Texte et liens
        </h3>
        <p className="mb-2 text-[#8C7B6B]">
          Vous pouvez utiliser la couleur d'accentuation pour mettre en évidence
          <span className="text-[#7D9D74] font-medium">
            {" "}
            des mots importants{" "}
          </span>
          dans votre texte ou pour créer des
          <a
            href="#"
            className="text-[#7D9D74] hover:text-[#5C7A53] hover:underline"
          >
            {" "}
            liens cliquables
          </a>
          .
        </p>
        <div className="p-4 bg-[#E1EBD9] rounded-lg text-[#5C7A53] mt-4">
          Ce bloc utilise la couleur d'accentuation la plus claire comme
          arrière-plan.
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher un échantillon de couleur
const ColorSwatch: React.FC<{
  color: string;
  name: string;
  variable: string;
}> = ({ color, name, variable }) => {
  return (
    <motion.div className="flex flex-col" whileHover={{ scale: 1.05 }}>
      <div
        className="h-16 rounded-md mb-2 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div className="text-sm font-medium text-[#5D4D40]">{name}</div>
      <div className="text-xs text-[#8C7B6B]">{color}</div>
      <div className="text-xs text-[#A89B8C]">{variable}</div>
    </motion.div>
  );
};

export default AccentDemo;
