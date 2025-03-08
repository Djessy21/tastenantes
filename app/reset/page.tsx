"use client";

import { useState } from "react";

export default function ResetPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  const resetDatabase = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir réinitialiser la base de données ? Toutes les données seront perdues."
      )
    ) {
      return;
    }

    setIsResetting(true);
    setResult({});

    try {
      const response = await fetch("/api/reset-db?key=reset-tastenantes-db", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Base de données réinitialisée avec succès",
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Une erreur est survenue",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Une erreur est survenue lors de la connexion au serveur",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Réinitialisation de la Base de Données
        </h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Cette action va réinitialiser complètement la base de données.
            Toutes les données existantes seront supprimées.
          </p>
          <p className="text-red-600 font-medium">
            Attention : Cette action est irréversible !
          </p>
        </div>

        {result.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{result.message}</p>
          </div>
        )}

        {result.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{result.error}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={resetDatabase}
            disabled={isResetting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
          >
            {isResetting
              ? "Réinitialisation en cours..."
              : "Réinitialiser la Base de Données"}
          </button>
        </div>
      </div>
    </div>
  );
}
