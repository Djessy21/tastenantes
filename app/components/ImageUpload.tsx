import { useState, useCallback, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onCreditSelect?: (credit: string) => void;
  initialCredit?: string;
  showCreditField?: boolean;
  imageType?: "dish" | "restaurant";
}

export default function ImageUpload({
  onImageSelect,
  onCreditSelect,
  initialCredit = "",
  showCreditField = true,
  imageType = "dish",
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
        formData.append("type", imageType); // Utiliser le type d'image spécifié

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
          className="w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer border-[#D2C8BC] hover:border-[#8C7B6B] transition-colors text-[#8C7B6B]"
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
          <label className="block text-sm font-medium text-[#5D4D40] mb-1">
            Crédit photo
          </label>
          <input
            type="text"
            value={photoCredit}
            onChange={handleCreditChange}
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B5D4F]"
            placeholder="@photographe ou Nom du photographe"
          />
          <p className="text-xs text-[#8C7B6B] mt-1">
            Compte Instagram (avec @) ou nom du photographe
          </p>
        </div>
      )}
    </div>
  );
}
