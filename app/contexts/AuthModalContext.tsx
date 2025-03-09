"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AuthModalType = "login" | "register" | null;

interface AuthModalContextType {
  modalType: AuthModalType;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<AuthModalType>(null);

  const openLoginModal = () => setModalType("login");
  const openRegisterModal = () => setModalType("register");
  const closeModal = () => setModalType(null);

  return (
    <AuthModalContext.Provider
      value={{
        modalType,
        openLoginModal,
        openRegisterModal,
        closeModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
