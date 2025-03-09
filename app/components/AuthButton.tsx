"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAdmin = session?.user?.role === "admin";
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Générer les initiales de l'utilisateur
  const getInitials = () => {
    if (!session?.user?.name) return "U";

    const nameParts = session.user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="h-10 w-10 rounded-full overflow-hidden border-2 border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          aria-expanded={showDropdown}
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "Utilisateur"}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-black text-white flex items-center justify-center text-sm font-medium">
              {getInitials()}
            </div>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name || "Utilisateur"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user.email}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black text-white mt-1">
                  Admin
                </span>
              )}
            </div>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowDropdown(false)}
            >
              Mon profil
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                Gérer les utilisateurs
              </Link>
            )}
            <button
              onClick={() => {
                setShowDropdown(false);
                signOut({ callbackUrl: "/" });
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    </Link>
  );
}
