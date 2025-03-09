"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "./AuthGuard";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: {
    id: string;
    name: string;
  };
}

export default function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Charger la liste des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users/role");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erreur:", error);
        setError("Impossible de charger la liste des utilisateurs");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Changer le rôle d'un utilisateur
  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/users/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, roleId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la modification du rôle"
        );
      }

      const updatedUser = await response.json();

      // Mettre à jour la liste des utilisateurs
      setUsers(
        users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );

      setSuccess(
        `Le rôle de ${
          updatedUser.name || updatedUser.email
        } a été mis à jour avec succès`
      );
    } catch (error: any) {
      console.error("Erreur:", error);
      setError(error.message || "Erreur lors de la modification du rôle");
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas un administrateur, ne pas afficher le composant
  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rôle
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || "Non défini"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role.id === "admin"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role.id === "admin" ? (
                        <button
                          onClick={() => handleRoleChange(user.id, "user")}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          Rétrograder
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(user.id, "admin")}
                          className="text-green-600 hover:text-green-900"
                          disabled={loading}
                        >
                          Promouvoir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
