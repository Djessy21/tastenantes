"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthModal } from "../contexts/AuthModalContext";
import { motion } from "framer-motion";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { openLoginModal } = useAuthModal();
  const [isMobile, setIsMobile] = useState(false);

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
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Vérifier le type de fichier
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError(
          "Type de fichier non pris en charge. Utilisez JPG, PNG ou WebP."
        );
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image est trop volumineuse. Taille maximale: 5MB.");
        return;
      }

      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    // Vérifier que le mot de passe est suffisamment fort
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }

    try {
      // Créer l'utilisateur
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(
          registerData.error || "Une erreur est survenue lors de l'inscription"
        );
        setLoading(false);
        return;
      }

      // Si un avatar a été sélectionné, l'uploader
      if (avatar) {
        // Se connecter d'abord
        const loginResponse = await fetch("/api/auth/callback/credentials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            redirect: false,
            callbackUrl: "/",
          }),
        });

        if (!loginResponse.ok) {
          // L'utilisateur a été créé mais la connexion a échoué
          // Rediriger vers la page de connexion
          openLoginModal();
          return;
        }

        // Uploader l'avatar
        const formData = new FormData();
        formData.append("file", avatar);

        const avatarResponse = await fetch("/api/user/upload-avatar", {
          method: "POST",
          body: formData,
        });

        if (!avatarResponse.ok) {
          // L'avatar n'a pas pu être uploadé, mais l'utilisateur est créé et connecté
          router.refresh();
          return;
        }
      }

      // Rafraîchir la page
      router.refresh();
    } catch (error) {
      setError("Une erreur est survenue lors de l'inscription");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
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

      <form
        onSubmit={handleSubmit}
        className={`space-y-${isMobile ? "3" : "5"}`}
      >
        {/* Avatar upload */}
        <div className="flex flex-col items-center mb-4">
          <div
            className={`relative ${
              isMobile ? "w-20 h-20" : "w-24 h-24"
            } rounded-full overflow-hidden bg-[#F5F2EE] border-2 border-[#E8E1D9] mb-2 cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#8C7B6B]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${isMobile ? "h-8 w-8" : "h-10 w-10"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#6B5D4F] hover:text-[#5D4D40] focus:outline-none transition-colors"
          >
            Choisir une photo de profil
          </button>
        </div>

        {/* Nom */}
        <div>
          <label
            htmlFor="name"
            className={`block text-${
              isMobile ? "xs" : "sm"
            } font-medium text-[#5D4D40] mb-1`}
          >
            Nom
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
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full pl-10 pr-3 py-${
                isMobile ? "2" : "2.5"
              } border border-[#E8E1D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B5D4F] focus:border-transparent transition-all duration-200 text-${
                isMobile ? "sm" : "base"
              }`}
              placeholder="Votre nom"
              required
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Mot de passe */}
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

        {/* Confirmer le mot de passe */}
        <div>
          <label
            htmlFor="confirmPassword"
            className={`block text-${
              isMobile ? "xs" : "sm"
            } font-medium text-[#5D4D40] mb-1`}
          >
            Confirmer le mot de passe
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
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C7B6B] hover:text-[#5D4D40] focus:outline-none transition-colors"
              aria-label={
                showConfirmPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              tabIndex={-1}
            >
              {showConfirmPassword ? (
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
              Inscription en cours...
            </div>
          ) : (
            "S'inscrire"
          )}
        </motion.button>
      </form>

      <div className="mt-4 text-center">
        <p className={`text-${isMobile ? "xs" : "sm"} text-[#8C7B6B]`}>
          Vous avez déjà un compte ?{" "}
          <button
            onClick={openLoginModal}
            className="font-medium text-[#6B5D4F] hover:text-[#5D4D40] focus:outline-none focus:underline transition-colors"
          >
            Connectez-vous
          </button>
        </p>
      </div>
    </motion.div>
  );
}
