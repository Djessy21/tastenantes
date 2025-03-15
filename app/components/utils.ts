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

/**
 * Vérifie si une URL est une URL externe (http/https)
 * @param url L'URL à vérifier
 * @returns true si l'URL est externe, false sinon
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Télécharge une image externe et la renvoie sous forme de File
 * @param url L'URL externe de l'image
 * @param filename Le nom de fichier à utiliser
 * @returns Une promesse qui se résout avec un objet File
 */
export async function downloadExternalImage(
  url: string,
  filename: string
): Promise<File> {
  try {
    console.log(`Téléchargement de l'image externe: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Erreur lors du téléchargement de l'image: ${response.status}`
      );
    }

    const blob = await response.blob();
    console.log(
      `Image téléchargée, taille: ${blob.size} bytes, type: ${blob.type}`
    );

    // Créer un objet File à partir du Blob
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image externe:", error);
    throw error;
  }
}
