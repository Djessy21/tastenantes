"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

// Composant pour les cartes d'administration
const AdminCard = ({
  title,
  description,
  icon,
  href,
  color = "pink",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color?: "pink" | "blue" | "green" | "purple" | "orange";
}) => {
  const colorClasses = {
    pink: {
      bg: "bg-pink-50",
      border: "border-pink-200",
      hover: "hover:border-pink-300",
      icon: "text-pink-600",
      shadow: "shadow-pink-100",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      hover: "hover:border-blue-300",
      icon: "text-blue-600",
      shadow: "shadow-blue-100",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      hover: "hover:border-green-300",
      icon: "text-green-600",
      shadow: "shadow-green-100",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      hover: "hover:border-purple-300",
      icon: "text-purple-600",
      shadow: "shadow-purple-100",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      hover: "hover:border-orange-300",
      icon: "text-orange-600",
      shadow: "shadow-orange-100",
    },
  };

  const classes = colorClasses[color];

  return (
    <Link href={href}>
      <motion.div
        className={`p-6 rounded-xl border ${classes.border} ${classes.bg} ${classes.hover} transition-all duration-300 shadow-md ${classes.shadow} hover:shadow-lg`}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-start">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${classes.bg} ${classes.icon} mr-4`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    }
  }, [status, router]);

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
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Tableau de bord administrateur
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Bienvenue, {session?.user?.name || "Administrateur"}. Gérez votre
            application depuis ce tableau de bord.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard
              title="Restaurants"
              description="Gérer les restaurants, ajouter ou modifier des informations."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              href="/admin/restaurants"
              color="pink"
            />

            <AdminCard
              title="Messages"
              description="Consulter et répondre aux messages de contact."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
              href="/admin/messages"
              color="blue"
            />

            <AdminCard
              title="Utilisateurs"
              description="Gérer les utilisateurs et leurs permissions."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
              href="/admin/users"
              color="green"
            />

            <AdminCard
              title="Statistiques"
              description="Consulter les statistiques et analyses du site."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              href="/admin/stats"
              color="purple"
            />

            <AdminCard
              title="Paramètres"
              description="Configurer les paramètres de l'application."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              href="/admin/settings"
              color="orange"
            />
          </div>

          <div className="mt-12">
            <Link
              href="/"
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
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
