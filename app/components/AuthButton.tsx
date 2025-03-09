"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAdmin = session?.user?.role === "admin";

  if (isLoading) {
    return (
      <button
        disabled
        className="text-xs uppercase tracking-wider px-3 py-1 border border-black/20 opacity-50 cursor-not-allowed"
      >
        Chargement...
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">
          {isAdmin ? "Admin" : "Utilisateur"}: {session.user.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs uppercase tracking-wider px-3 py-1 border border-black/20 hover:border-black transition-colors"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-xs uppercase tracking-wider px-3 py-1 border border-black/20 hover:border-black transition-colors"
    >
      Connexion
    </Link>
  );
}
