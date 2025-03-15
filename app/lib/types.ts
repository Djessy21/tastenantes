/**
 * Types utilisés dans l'application Taste Nantes
 */

/**
 * Interface pour les fichiers téléchargés
 * Utilisée par le service d'image pour traiter les fichiers
 */
export interface UploadedFile {
  /** Buffer contenant les données binaires du fichier */
  buffer: Buffer;
  /** Nom original du fichier */
  originalname: string;
  /** Type MIME du fichier */
  mimetype: string;
  /** Taille du fichier en octets */
  size: number;
}

/**
 * Interface pour les options de téléchargement d'image
 */
export interface ImageUploadOptions {
  /** Type d'image (restaurant, dish, etc.) */
  type: string;
  /** Identifiant unique pour l'image */
  uniqueId?: string;
  /** Forcer le rechargement de l'image (ignorer le cache) */
  forceReload?: boolean;
}
