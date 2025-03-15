import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

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

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        console.log(
          `Image locale sélectionnée: ${file.name}, taille: ${file.size} bytes, type: ${file.type}`
        );

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

          // Créer un identifiant unique pour éviter les conflits avec les images de test
          // Utiliser un préfixe 'user_' pour distinguer des images de test
          const uniqueId = `user_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 15)}`;
          console.log(
            `Identifiant unique généré pour l'image utilisateur: ${uniqueId}`
          );

          const formData = new FormData();
          formData.append("image", file);
          formData.append("type", imageType);
          formData.append("uniqueId", uniqueId);

          console.log(
            `Envoi de l'image utilisateur à l'API d'upload avec uniqueId: ${uniqueId}`
          );
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(
              `Upload failed: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();
          console.log(
            `Image utilisateur uploadée avec succès: ${
              data.url || data.imageUrl
            }`
          );

          // Mettre à jour l'URL avec celle retournée par l'API
          // Vérifier si la réponse contient url ou imageUrl (pour compatibilité)
          if (data.url || data.imageUrl) {
            onImageSelect(data.url || data.imageUrl);
          } else {
            console.error(
              "La réponse de l'API ne contient pas d'URL d'image valide:",
              data
            );
            // Utiliser l'URL de prévisualisation comme fallback
            if (previewUrl) {
              onImageSelect(previewUrl);
            } else {
              onImageSelect(`/default-${imageType}.svg`);
            }
          }
        } catch (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
          // Toujours fournir une URL par défaut, même en développement
          // Si nous avons déjà une prévisualisation, l'utiliser
          if (previewUrl) {
            console.log(
              `Utilisation de l'URL de prévisualisation comme fallback: ${previewUrl}`
            );
            onImageSelect(previewUrl);
          } else {
            console.log(
              `Utilisation de l'image par défaut: /default-${imageType}.svg`
            );
            onImageSelect(`/default-${imageType}.svg`);
          }
        } finally {
          setIsLoading(false);
        }
      }
    },
    [onImageSelect, imageType, previewUrl]
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
            <span>
              Cliquez pour sélectionner une image depuis votre appareil
            </span>
          )}
        </button>
        <p className="text-xs text-brown-medium mt-2">
          Sélectionnez une image depuis votre appareil pour l'ajouter à votre
          restaurant ou plat. Les formats JPG, PNG et WebP sont recommandés.
        </p>
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
