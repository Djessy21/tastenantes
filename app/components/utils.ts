/**
 * Ajoute un paramètre de requête unique à une URL pour contourner le cache du navigateur
 * @param url L'URL de l'image à décacher
 * @param forceReload Si true, ajoute un timestamp unique pour forcer le rechargement
 * @returns L'URL avec un paramètre de requête unique
 */
export function getUncachedImageUrl(
  url: string | undefined | null,
  forceReload: boolean = false
): string {
  if (!url) return "/default-image.svg";

  // Si l'URL est une image par défaut, la retourner telle quelle
  if (url.includes("default-")) return url;

  // Si l'URL contient déjà un paramètre de requête et qu'on ne force pas le rechargement, la retourner telle quelle
  if (url.includes("?") && !forceReload) return url;

  // Nettoyer l'URL en supprimant les paramètres de requête existants
  const baseUrl = url.split("?")[0];

  // Ajouter un timestamp unique pour contourner le cache uniquement si forceReload est true
  if (forceReload) {
    return `${baseUrl}?t=${Date.now()}`;
  }

  // Sinon, ajouter un paramètre de requête fixe pour permettre la mise en cache
  return `${baseUrl}?v=1`;
}

/**
 * Précharge une image pour s'assurer qu'elle est disponible dans le cache du navigateur
 * @param url L'URL de l'image à précharger
 * @returns Une promesse qui se résout lorsque l'image est chargée
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log(`Image préchargée avec succès: ${url}`);
      resolve();
    };
    img.onerror = (error) => {
      console.error(`Erreur lors du préchargement de l'image: ${url}`, error);
      reject(error);
    };
    img.src = getUncachedImageUrl(url, false);
  });
}

/**
 * Vide le cache d'une image en forçant son rechargement
 * @param url L'URL de l'image à vider du cache
 */
export function clearImageCache(url: string): void {
  if (!url) return;

  // Cette fonction est maintenue pour compatibilité mais simplifiée
  // pour éviter les opérations coûteuses
}
