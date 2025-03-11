/**
 * Utilitaire pour gérer les environnements (development, preview, production)
 */

// Détermine l'environnement actuel
export const getEnvironment = (): "development" | "preview" | "production" => {
  // Priorité à la variable d'environnement NEXT_PUBLIC_VERCEL_ENV
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (
    vercelEnv === "development" ||
    vercelEnv === "preview" ||
    vercelEnv === "production"
  ) {
    return vercelEnv;
  }

  // Sinon, utiliser NODE_ENV
  if (process.env.NODE_ENV === "development") {
    return "development";
  }

  // Pour Vercel, vérifier si c'est un déploiement de preview
  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }

  // Par défaut, considérer comme production
  return "production";
};

// Vérifie si nous sommes en environnement de développement
export const isDevelopment = (): boolean => {
  return getEnvironment() === "development";
};

// Vérifie si nous sommes en environnement de preview
export const isPreview = (): boolean => {
  return getEnvironment() === "preview";
};

// Vérifie si nous sommes en environnement de production
export const isProduction = (): boolean => {
  return getEnvironment() === "production";
};

// Retourne un préfixe pour les logs selon l'environnement
export const getEnvironmentPrefix = (): string => {
  const env = getEnvironment();
  switch (env) {
    case "development":
      return "[DEV]";
    case "preview":
      return "[PREVIEW]";
    case "production":
      return "[PROD]";
  }
};

// Expose l'environnement actuel pour le client
export const currentEnvironment = getEnvironment();
