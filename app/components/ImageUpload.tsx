import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onCreditSelect?: (credit: string) => void;
  initialCredit?: string;
  initialImage?: string;
  showCreditField?: boolean;
  imageType?: "dish" | "restaurant";
}

export default function ImageUpload({
  onImageSelect,
  onCreditSelect,
  initialCredit = "",
  initialImage = "",
  showCreditField = true,
  imageType = "dish",
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoCredit, setPhotoCredit] = useState(initialCredit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser l'aperçu avec l'image initiale si elle existe
  useEffect(() => {
    if (initialImage) {
      // Nettoyer l'URL de l'image en supprimant les paramètres de requête
      const cleanImageUrl = initialImage.split("?")[0];
      setPreviewUrl(cleanImageUrl);
    }
  }, [initialImage]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Créer une URL temporaire pour la prévisualisation
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Pour le développement local, on utilise directement l'URL temporaire
      if (process.env.NODE_ENV === "development") {
        onImageSelect(objectUrl);
        return;
      }

      // En production, on uploadera l'image vers un service de stockage
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", imageType); // Utiliser le type d'image spécifié
        // Ajouter un identifiant unique pour éviter les conflits de noms de fichiers
        const uniqueId = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}`;
        formData.append("uniqueId", uniqueId);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          // Désactiver la mise en cache
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        // Utiliser l'URL complète sans ajouter de paramètres supplémentaires
        onImageSelect(data.imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        // En cas d'erreur, on utilise une image par défaut
        onImageSelect(`/default-${imageType}.svg`);
      } finally {
        setIsLoading(false);
      }
    },
    [onImageSelect, imageType]
  );

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCredit = e.target.value;
    setPhotoCredit(newCredit);
    if (onCreditSelect) {
      onCreditSelect(newCredit);
    }
  };

  const handleButtonClick = () => {
    // Déclencher le clic sur l'input file caché
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
          ref={fileInputRef}
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer border-beige-dark hover:border-brown-medium transition-colors text-brown-medium"
        >
          {isLoading ? (
            <span>Chargement...</span>
          ) : (
            <span>Cliquez pour sélectionner une image</span>
          )}
        </button>
      </div>

      {previewUrl && (
        <div className="relative aspect-video w-full">
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover rounded-lg w-full h-full"
            key={`preview-${previewUrl}`} // Forcer le rechargement de l'image quand l'URL change
          />
        </div>
      )}

      {showCreditField && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-brown-darker mb-1">
            Crédit photo
          </label>
          <input
            type="text"
            value={photoCredit}
            onChange={handleCreditChange}
            className="w-full px-3 py-2 border border-beige-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brown-dark"
            placeholder="@photographe ou Nom du photographe"
          />
          <p className="text-xs text-brown-medium mt-1">
            Compte Instagram (avec @) ou nom du photographe
          </p>
        </div>
      )}
    </div>
  );
}
