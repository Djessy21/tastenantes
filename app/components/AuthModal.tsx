"use client";

import { useAuthModal } from "../contexts/AuthModalContext";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function AuthModal() {
  const { modalType, closeModal } = useAuthModal();
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

  return (
    <Modal isOpen={modalType !== null} onClose={closeModal} title={null}>
      <div className="flex flex-col">
        <div className="text-center mb-4">
          <h2
            className={`${
              isMobile ? "text-xl" : "text-2xl"
            } font-bold text-[#5D4D40]`}
          >
            {modalType === "login" ? "Bienvenue" : "Rejoignez-nous"}
          </h2>
          <p className="text-[#8C7B6B] mt-1 text-sm">
            {modalType === "login"
              ? "Connectez-vous pour accéder à votre compte"
              : "Créez un compte pour une expérience personnalisée"}
          </p>
        </div>

        {modalType === "login" && (
          <div className="flex justify-center mb-4">
            <div className={`relative ${isMobile ? "w-24 h-24" : "w-32 h-32"}`}>
              <Image
                src="/images/login-illustration.svg"
                alt="Connexion"
                width={isMobile ? 96 : 128}
                height={isMobile ? 96 : 128}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        <div className="w-full">
          {modalType === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </Modal>
  );
}
