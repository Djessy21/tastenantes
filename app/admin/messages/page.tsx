"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export default function AdminMessages() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [clearAllError, setClearAllError] = useState<string | null>(null);

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/messages");
      return;
    }

    // Charger les messages si l'utilisateur est connecté
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log("Chargement des messages...");

      // Ajouter un paramètre timestamp pour éviter le cache
      const timestamp = new Date().getTime();

      // Utiliser l'API de contournement qui ignore les vérifications d'authentification
      const response = await fetch(`/api/admin/messages/bypass?t=${timestamp}`);
      console.log("Statut de la réponse:", response.status);

      const data = await response.json();
      console.log("Données reçues:", data);

      if (!response.ok) {
        throw new Error(
          `Erreur ${response.status}: ${data.error || "Erreur inconnue"}`
        );
      }

      if (!data.messages || !Array.isArray(data.messages)) {
        console.error("Format de données invalide:", data);
        setError("Format de données invalide. Veuillez réessayer.");
        return;
      }

      console.log(`${data.messages.length} messages récupérés`);

      // Transformer les messages pour s'assurer que toutes les propriétés sont correctement formatées
      const formattedMessages = data.messages.map((msg: any) => ({
        id: msg.id || 0,
        name: msg.name || "Nom inconnu",
        email: msg.email || "Email inconnu",
        subject: msg.subject || "Sujet inconnu",
        message: msg.message || "Message vide",
        isRead: msg.is_read || false,
        createdAt: msg.created_at || new Date().toISOString(),
        readAt: msg.read_at || null,
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error("Erreur complète:", err);
      setError(
        `Impossible de charger les messages: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    if (!id) {
      console.error("ID de message invalide:", id);
      return;
    }

    try {
      console.log("Marquage du message comme lu:", id);
      const response = await fetch(`/api/admin/messages/${id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Statut de la réponse:", response.status);
      const data = await response.json();
      console.log("Données reçues:", data);

      if (!response.ok) {
        throw new Error(
          `Erreur ${response.status}: ${data.error || "Erreur inconnue"}`
        );
      }

      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setMessages(
        messages.map((msg) =>
          msg.id === id
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        )
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          isRead: true,
          readAt: new Date().toISOString(),
        });
      }

      toast.success("Message marqué comme lu");

      // Rafraîchir la liste des messages après un court délai
      setTimeout(() => {
        fetchMessages();
      }, 500);
    } catch (err) {
      console.error("Erreur lors du marquage du message comme lu:", err);
      toast.error(
        `Erreur: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const deleteMessage = async (id: number) => {
    if (!id) {
      console.error("ID de message invalide:", id);
      return;
    }

    // Demander confirmation avant de supprimer
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      console.log("Suppression du message:", id);
      const response = await fetch(`/api/admin/messages/${id}/delete`, {
        method: "DELETE",
      });

      console.log("Statut de la réponse:", response.status);
      const data = await response.json();
      console.log("Données reçues:", data);

      if (!response.ok) {
        throw new Error(
          `Erreur ${response.status}: ${data.error || "Erreur inconnue"}`
        );
      }

      // Mettre à jour l'état local
      setMessages(messages.filter((msg) => msg.id !== id));

      // Si le message supprimé était sélectionné, désélectionner
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }

      // Afficher un message de succès temporaire
      toast.success("Message supprimé avec succès");
    } catch (err) {
      console.error("Erreur lors de la suppression du message:", err);
      setDeleteError(
        `Erreur lors de la suppression: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllMessages = async () => {
    // Demander confirmation
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer TOUS les messages ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setIsClearingAll(true);
    setClearAllError(null);

    try {
      const response = await fetch("/api/admin/messages/clear", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Confirm-Clear": "true",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la suppression des messages"
        );
      }

      // Mettre à jour l'état local
      setMessages([]);
      setSelectedMessage(null);
      toast.success("Tous les messages ont été supprimés avec succès");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de tous les messages:",
        error
      );
      setClearAllError(
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      toast.error("Erreur lors de la suppression des messages");
    } finally {
      setIsClearingAll(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";

    try {
      const date = new Date(dateString);

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.error("Date invalide:", dateString);
        return "Date invalide";
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error, dateString);
      return "Erreur de date";
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-32 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Messages de contact
          </motion.h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Liste des messages */}
            <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Messages
                    </h2>
                    <p className="text-sm text-gray-500">
                      {messages.length} message(s) reçu(s)
                    </p>
                  </div>
                  <button
                    onClick={fetchMessages}
                    disabled={loading}
                    className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    title="Rafraîchir la liste"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">
                    Chargement des messages...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucun message reçu pour le moment.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {messages.map((msg) => (
                    <li
                      key={msg.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedMessage?.id === msg.id ? "bg-gray-50" : ""
                      } ${!msg.isRead ? "font-semibold" : ""}`}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.isRead && msg.id) {
                          markAsRead(msg.id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {!msg.isRead && (
                              <span className="inline-block w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
                            )}
                            {msg.name || "Anonyme"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {msg.subject || "Sans sujet"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Reçu le {formatDate(msg.createdAt)}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 ml-2">
                          {msg.isRead ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Lu
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                              Non lu
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Détail du message */}
            <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-hidden">
              {selectedMessage ? (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedMessage.subject || "Sans sujet"}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {formatDate(selectedMessage.createdAt)}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">De:</p>
                    <p className="font-medium">
                      {selectedMessage.name || "Anonyme"}{" "}
                      {selectedMessage.email
                        ? `<${selectedMessage.email}>`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reçu le: {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg mb-6 whitespace-pre-wrap">
                    {selectedMessage.message || "Aucun contenu"}
                  </div>

                  {deleteError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-500">
                        {selectedMessage.isRead
                          ? `Lu le ${
                              selectedMessage.readAt
                                ? formatDate(selectedMessage.readAt)
                                : formatDate(selectedMessage.createdAt)
                            }`
                          : "Non lu"}
                      </div>
                      {!selectedMessage.isRead && (
                        <button
                          onClick={() => markAsRead(selectedMessage.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      {selectedMessage.email && (
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          Répondre par email
                        </a>
                      )}
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Suppression...
                          </>
                        ) : (
                          <>
                            <svg
                              className="mr-2 h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Supprimer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Sélectionnez un message pour voir son contenu.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/admin"
              className="inline-flex items-center text-pink-600 hover:text-pink-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour au tableau de bord
            </Link>
          </div>

          <div className="mt-8">
            <button
              onClick={clearAllMessages}
              disabled={isClearingAll || messages.length === 0}
              className={`px-3 py-1 rounded text-sm ${
                isClearingAll || messages.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {isClearingAll ? "Suppression..." : "Tout supprimer"}
            </button>
          </div>

          {clearAllError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p>{clearAllError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
