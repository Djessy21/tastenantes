import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import UserManagement from "@/app/components/UserManagement";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!session) {
    redirect("/login");
  }

  // Rediriger vers la page d'accueil si l'utilisateur n'est pas un administrateur
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Administration des utilisateurs
          </h1>

          <div className="mb-8">
            <p className="text-center text-gray-600">
              Cette page vous permet de gérer les utilisateurs et leurs rôles.
            </p>
          </div>

          <UserManagement />
        </div>
      </div>
    </div>
  );
}
