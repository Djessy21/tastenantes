import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordForm from "@/app/components/ChangePasswordForm";
import AuthGuard from "@/app/components/AuthGuard";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!session) {
    redirect("/login");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Mon profil</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Informations personnelles
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="mt-1">{session.user.name || "Non défini"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rôle</p>
                  <p className="mt-1 capitalize">
                    {session.user.role || "Utilisateur"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
