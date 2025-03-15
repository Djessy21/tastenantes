import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { isExternalUrl, downloadExternalImage } from "./utils";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onCreditSelect?: (credit: string) => void;
  initialCredit?: string;
  initialImage?: string;
  showCreditField?: boolean;
  imageType?: "dish" | "restaurant";
  className?: string;
  height?: string;
  alt?: string;
}

export default function ImageUpload({
  onImageSelect,
  onCreditSelect,
  initialCredit = "",
  initialImage = "",
  showCreditField = true,
  imageType = "dish",
  className,
  height,
  alt,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoCredit, setPhotoCredit] = useState(initialCredit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer l'image initiale
  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }

    // Nettoyage lors du démontage du composant
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [initialImage]);

  // Fonction pour traiter une URL externe
  const handleExternalUrl = useCallback(
    async (url: string) => {
      try {
        console.log(`Traitement de l'URL externe: ${url}`);
        setIsLoading(true);

        // Générer un nom de fichier unique
        const filename = `${imageType}_${Date.now()}.jpg`;

        // Télécharger l'image externe
        const file = await downloadExternalImage(url, filename);

        // Uploader l'image vers l'API
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", imageType);
        formData.append(
          "uniqueId",
          `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        );

        console.log(`Envoi de l'image téléchargée à l'API d'upload`);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        console.log(`Image uploadée avec succès: ${data.imageUrl}`);

        // Mettre à jour l'URL avec celle retournée par l'API
        onImageSelect(data.imageUrl);

        // Mettre à jour la prévisualisation
        setPreviewUrl(data.imageUrl);
      } catch (error) {
        console.error("Erreur lors du traitement de l'URL externe:", error);
        // En cas d'erreur, utiliser une image par défaut
        onImageSelect(`/default-${imageType}.svg`);
        setPreviewUrl(`/default-${imageType}.svg`);
      } finally {
        setIsLoading(false);
      }
    },
    [imageType, onImageSelect]
  );

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        // Révoquer l'ancienne URL d'objet si c'est un blob
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }

        // Créer une URL temporaire pour la prévisualisation
        const newObjectUrl = URL.createObjectURL(file);
        setPreviewUrl(newObjectUrl);

        // Afficher immédiatement la prévisualisation pour une meilleure expérience utilisateur
        onImageSelect(newObjectUrl);

        // Uploader l'image vers l'API en arrière-plan
        try {
          setIsLoading(true);
          const formData = new FormData();
          formData.append("image", file);
          formData.append("type", imageType);
          formData.append(
            "uniqueId",
            `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
          );

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          // Mettre à jour l'URL avec celle retournée par l'API
          onImageSelect(data.imageUrl);
        } catch (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
          // En cas d'erreur, on conserve l'URL de blob en développement
          if (process.env.NODE_ENV !== "development") {
            // En production, on utilise une image par défaut
            onImageSelect(`/default-${imageType}.svg`);
          }
        } finally {
          setIsLoading(false);
        }
      }
    },
    [onImageSelect, imageType, previewUrl]
  );

  // Fonction pour gérer les URLs externes collées
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      const clipboardData = e.clipboardData;
      const pastedText = clipboardData.getData("text");

      // Vérifier si le texte collé est une URL externe
      if (pastedText && isExternalUrl(pastedText)) {
        e.preventDefault();
        console.log(`URL externe détectée lors du collage: ${pastedText}`);
        await handleExternalUrl(pastedText);
      }
    },
    [handleExternalUrl]
  );

  // Fonction pour gérer les URLs externes saisies manuellement
  const handleUrlInput = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const input = e.currentTarget;
        const url = input.value.trim();

        if (url && isExternalUrl(url)) {
          e.preventDefault();
          console.log(`URL externe saisie manuellement: ${url}`);
          input.value = "";
          await handleExternalUrl(url);
        }
      }
    },
    [handleExternalUrl]
  );

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCredit = e.target.value;
    setPhotoCredit(newCredit);
    if (onCreditSelect) {
      onCreditSelect(newCredit);
    }
  };

  // Fonction pour déclencher le clic sur l'input file
  const triggerFileInput = () => {
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
          onClick={triggerFileInput}
          className="w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer border-beige-dark hover:border-brown-medium transition-colors text-brown-medium"
        >
          {isLoading ? (
            <span>Chargement...</span>
          ) : (
            <span>Cliquez pour sélectionner une image</span>
          )}
        </button>

        {/* Input pour les URLs externes */}
        <div className="mt-2">
          <input
            type="text"
            placeholder="Ou collez une URL d'image externe (https://...)"
            className="w-full px-3 py-2 border border-beige-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brown-dark"
            onPaste={handlePaste}
            onKeyDown={handleUrlInput}
          />
          <p className="text-xs text-brown-medium mt-1">
            Appuyez sur Entrée après avoir saisi une URL
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="relative aspect-video w-full">
          <img
            src={previewUrl}
            alt={alt || "Image"}
            className="object-cover rounded-lg w-full h-full"
            loading="eager"
            decoding="sync"
            onError={(e) => {
              console.error(`Erreur de chargement de l'image: ${previewUrl}`);
              e.currentTarget.src = `/default-${imageType}.svg`;
            }}
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
