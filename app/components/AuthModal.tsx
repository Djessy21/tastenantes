"use client";

import { useAuthModal } from "../contexts/AuthModalContext";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Image from "next/image";

export default function AuthModal() {
  const { modalType, closeModal } = useAuthModal();

  return (
    <Modal isOpen={modalType !== null} onClose={closeModal} title={null}>
      <div className="flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {modalType === "login" ? "Bienvenue" : "Rejoignez-nous"}
          </h2>
          <p className="text-gray-500 mt-1">
            {modalType === "login"
              ? "Connectez-vous pour accéder à votre compte"
              : "Créez un compte pour une expérience personnalisée"}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <Image
              src={
                modalType === "login"
                  ? "/images/login-illustration.svg"
                  : "/images/register-illustration.svg"
              }
              alt={modalType === "login" ? "Connexion" : "Inscription"}
              width={128}
              height={128}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        <div className="w-full">
          {modalType === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </Modal>
  );
}
