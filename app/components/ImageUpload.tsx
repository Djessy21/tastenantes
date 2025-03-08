import { useState, useCallback } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
}

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        onImageSelect(data.url);
      } catch (error) {
        console.error("Error uploading image:", error);
        // En cas d'erreur, on utilise une image par défaut
        onImageSelect("https://placehold.co/600x400?text=Error+Loading+Image");
      } finally {
        setIsLoading(false);
      }
    },
    [onImageSelect]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="block w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
        >
          {isLoading ? (
            <span>Chargement...</span>
          ) : (
            <span>Cliquez ou déposez une image ici</span>
          )}
        </label>
      </div>

      {previewUrl && (
        <div className="relative aspect-video w-full">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
