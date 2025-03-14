"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModal } from "../contexts/AuthModalContext";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openRegisterModal, closeModal } = useAuthModal();
  const [isMobile, setIsMobile] = useState(false);

  // Vérifier si l'utilisateur vient de s'inscrire
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccess(
        "Inscription réussie ! Vous pouvez maintenant vous connecter."
      );
    }
  }, [searchParams]);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Vérifier au chargement
    checkIfMobile();

    // Vérifier au redimensionnement
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Identifiants invalides");
      } else {
        closeModal(); // Fermer le modal après une connexion réussie
        router.refresh();
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {error && (
        <motion.div
          className="mb-3 p-2 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center text-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          className="mb-3 p-2 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center text-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </motion.div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`space-y-${isMobile ? "3" : "5"}`}
      >
        <div>
          <label
            htmlFor="email"
            className={`block text-${
              isMobile ? "xs" : "sm"
            } font-medium text-[#5D4D40] mb-1`}
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7B6B]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-3 py-${
                isMobile ? "2" : "2.5"
              } border border-[#E8E1D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B5D4F] focus:border-transparent transition-all duration-200 text-${
                isMobile ? "sm" : "base"
              }`}
              placeholder="votre@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className={`block text-${
              isMobile ? "xs" : "sm"
            } font-medium text-[#5D4D40] mb-1`}
          >
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7B6B]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-${
                isMobile ? "2" : "2.5"
              } border border-[#E8E1D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B5D4F] focus:border-transparent transition-all duration-200 text-${
                isMobile ? "sm" : "base"
              }`}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C7B6B] hover:text-[#5D4D40] focus:outline-none transition-colors"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className={`w-full py-${
            isMobile ? "2" : "2.5"
          } px-4 bg-[#6B5D4F] text-white rounded-lg hover:bg-[#5D4D40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B5D4F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-${
            isMobile ? "sm" : "base"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className={`animate-spin -ml-1 mr-2 ${
                  isMobile ? "h-3 w-3" : "h-4 w-4"
                } text-white`}
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
              Connexion en cours...
            </div>
          ) : (
            "Se connecter"
          )}
        </motion.button>

        {/* Lien vers l'inscription */}
        <div className="text-center mt-4">
          <p className={`text-${isMobile ? "xs" : "sm"} text-[#8C7B6B]`}>
            Vous n'avez pas de compte ?{" "}
            <button
              type="button"
              onClick={openRegisterModal}
              className="font-medium text-[#6B5D4F] hover:text-[#5D4D40] focus:outline-none focus:underline transition-colors"
            >
              Inscrivez-vous
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
