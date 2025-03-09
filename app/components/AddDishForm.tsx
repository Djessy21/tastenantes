import { useState, FormEvent } from "react";
import ImageUpload from "./ImageUpload";

interface AddDishFormProps {
  restaurantId: string;
  onDishAdded: () => void;
}

export default function AddDishForm({
  restaurantId,
  onDishAdded,
}: AddDishFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [photoCredit, setPhotoCredit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Vérifier que le prix est un nombre valide
      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        setError("Le prix doit être un nombre positif");
        setIsSubmitting(false);
        return;
      }

      // Créer le plat
      const response = await fetch(`/api/restaurants/${restaurantId}/dishes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          photo_credit: photoCredit,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du plat");
      }

      // Réinitialiser le formulaire
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setPhotoCredit("");

      // Notifier le parent que le plat a été ajouté
      onDishAdded();
    } catch (error) {
      console.error("Erreur lors de l'ajout du plat:", error);
      setError("Une erreur est survenue lors de l'ajout du plat");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Nom du plat
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700"
        >
          Prix (€)
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image et crédit photo
        </label>
        <ImageUpload
          onImageSelect={setImageUrl}
          onCreditSelect={setPhotoCredit}
          initialCredit={photoCredit}
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isSubmitting || !imageUrl}
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-black/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Ajout en cours..." : "Ajouter le plat"}
      </button>
    </form>
  );
}
