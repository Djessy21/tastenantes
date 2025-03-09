"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function AuthGuard({
  children,
  requiredRole = "user",
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const userRole = session?.user?.role;

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté et que le chargement est terminé, rediriger vers la page de connexion
    if (!isLoading && !session) {
      router.push("/login");
    }

    // Si l'utilisateur est connecté mais n'a pas le rôle requis, rediriger vers la page d'accueil
    if (
      session &&
      userRole &&
      requiredRole &&
      userRole !== requiredRole &&
      userRole !== "admin"
    ) {
      router.push("/");
    }
  }, [session, isLoading, router, userRole, requiredRole]);

  // Afficher un message de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne pas afficher le contenu
  if (!session) {
    return null;
  }

  // Si l'utilisateur n'a pas le rôle requis, ne pas afficher le contenu
  if (
    userRole &&
    requiredRole &&
    userRole !== requiredRole &&
    userRole !== "admin"
  ) {
    return null;
  }

  // Si l'utilisateur est connecté et a le rôle requis, afficher le contenu
  return <>{children}</>;
}
