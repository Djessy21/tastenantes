import RegisterForm from "@/app/components/RegisterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Taste Nantes</h1>
          <p className="mt-2 text-gray-600">
            Créez un compte pour découvrir les meilleurs restaurants de Nantes
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
