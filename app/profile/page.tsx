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
      <div className="min-h-screen bg-beige-lighter py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-brown-darker">
              Mon profil
            </h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8 border border-beige-medium">
              <h2 className="text-xl font-semibold mb-4 text-brown-darker">
                Informations personnelles
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-brown-medium">Nom</p>
                  <p className="mt-1 text-brown-darker">
                    {session.user.name || "Non défini"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-medium">Email</p>
                  <p className="mt-1 text-brown-darker">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-medium">Rôle</p>
                  <p className="mt-1 capitalize text-brown-darker">
                    {session.user.role === "admin" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-white">
                        Admin
                      </span>
                    ) : (
                      "Utilisateur"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 border border-beige-medium">
              <h2 className="text-xl font-semibold mb-6 text-brown-darker">
                Changer de mot de passe
              </h2>
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
