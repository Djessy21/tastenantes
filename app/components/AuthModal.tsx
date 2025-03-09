"use client";

import { useAuthModal } from "../contexts/AuthModalContext";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal() {
  const { modalType, closeModal } = useAuthModal();

  return (
    <Modal
      isOpen={modalType !== null}
      onClose={closeModal}
      title={modalType === "login" ? "Connexion" : "Créer un compte"}
    >
      {modalType === "login" ? <LoginForm /> : <RegisterForm />}
    </Modal>
  );
}
