import { useState, useCallback, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onCreditSelect?: (credit: string) => void;
  initialCredit?: string;
  showCreditField?: boolean;
}

export default function ImageUpload({
  onImageSelect,
  onCreditSelect,
  initialCredit = "",
  showCreditField = true,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoCredit, setPhotoCredit] = useState(initialCredit);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        formData.append("type", "dish"); // Spécifier le type d'image

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        onImageSelect(data.imageUrl); // Utiliser imageUrl au lieu de url
      } catch (error) {
        console.error("Error uploading image:", error);
        // En cas d'erreur, on utilise une image par défaut
        onImageSelect("/default-dish.svg");
      } finally {
        setIsLoading(false);
      }
    },
    [onImageSelect]
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
          className="w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
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
          />
        </div>
      )}

      {showCreditField && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crédit photo
          </label>
          <input
            type="text"
            value={photoCredit}
            onChange={handleCreditChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="@photographe ou Nom du photographe"
          />
          <p className="text-xs text-gray-500 mt-1">
            Compte Instagram (avec @) ou nom du photographe
          </p>
        </div>
      )}
    </div>
  );
}
