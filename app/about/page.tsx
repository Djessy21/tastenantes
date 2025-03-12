"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

// Composant pour les sections animées
const AnimatedSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Composant pour les cartes de valeurs
const ValueCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Composant pour les membres de l'équipe
const TeamMember = ({
  name,
  role,
  image,
}: {
  name: string;
  role: string;
  image: string;
}) => {
  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-300 hover:scale-110"
        />
      </div>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600">{role}</p>
    </div>
  );
};

export default function About() {
  return (
    <div className="pt-16 pb-32 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>À propos - Taste Nantes</title>
        <meta
          name="description"
          content="Découvrez l'histoire et la mission de Taste Nantes, votre guide gastronomique à Nantes."
        />
      </Head>

      <div className="dior-container max-w-5xl mx-auto px-4">
        <AnimatedSection>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            À propos de Taste Nantes
          </motion.h1>

          <motion.div
            className="w-20 h-1 bg-pink-600 mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          <motion.p
            className="text-center text-gray-600 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Votre guide gastronomique pour découvrir les meilleurs restaurants
            de Nantes, certifiés par des experts locaux passionnés de cuisine.
          </motion.p>
        </AnimatedSection>

        {/* Notre histoire */}
        <AnimatedSection delay={0.2} className="mt-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 text-pink-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </span>
              Notre histoire
            </h2>

            <div className="space-y-4 text-gray-600">
              <p>
                Taste Nantes est né en 2023 d'une passion commune pour la
                gastronomie nantaise et d'un constat simple : il était difficile
                de trouver une ressource fiable et moderne pour découvrir les
                meilleurs restaurants de Nantes.
              </p>
              <p>
                Fondé par un groupe d'amis passionnés de cuisine et de
                technologie, notre plateforme a pour mission de mettre en valeur
                la richesse culinaire de Nantes tout en offrant une expérience
                utilisateur exceptionnelle.
              </p>
              <p>
                Ce qui nous distingue ? Chaque restaurant présenté sur Taste
                Nantes est certifié par un expert local, garantissant ainsi
                l'authenticité et la qualité des établissements recommandés.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Nos valeurs */}
        <AnimatedSection delay={0.3} className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Nos valeurs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Authenticité"
              description="Nous valorisons les expériences culinaires authentiques et les saveurs qui racontent une histoire."
            />

            <ValueCard
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              title="Communauté"
              description="Nous croyons en la force de la communauté locale pour soutenir et faire découvrir les talents culinaires."
            />

            <ValueCard
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              }
              title="Innovation"
              description="Nous repoussons constamment les limites pour offrir une expérience utilisateur moderne et intuitive."
            />
          </div>
        </AnimatedSection>

        {/* Notre équipe */}
        <AnimatedSection delay={0.4} className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Notre équipe
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <TeamMember
              name="Sophie Martin"
              role="Fondatrice & CEO"
              image="/default-restaurant.svg"
            />

            <TeamMember
              name="Thomas Dupont"
              role="Chef Culinaire"
              image="/default-restaurant.svg"
            />

            <TeamMember
              name="Emma Leclerc"
              role="Responsable Partenariats"
              image="/default-restaurant.svg"
            />

            <TeamMember
              name="Lucas Moreau"
              role="Développeur"
              image="/default-restaurant.svg"
            />
          </div>
        </AnimatedSection>

        {/* Rejoignez-nous */}
        <AnimatedSection delay={0.5} className="mt-16">
          <div className="bg-black text-white rounded-2xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Rejoignez l'aventure Taste Nantes
            </h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Vous êtes passionné(e) de gastronomie et souhaitez contribuer à
              notre mission ? Nous sommes toujours à la recherche de nouveaux
              talents et de partenaires.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contactez-nous
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.6} className="mt-16 text-center">
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
        </AnimatedSection>
      </div>
    </div>
  );
}
