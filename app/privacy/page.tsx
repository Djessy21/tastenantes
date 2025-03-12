"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Head from "next/head";

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
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Composant pour les sections de politique
const PolicySection = ({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 text-pink-600">
          {icon}
        </span>
        {title}
      </h2>
      <div className="pl-11 space-y-3 text-gray-600">{children}</div>
    </div>
  );
};

export default function Privacy() {
  const lastUpdated = "15 mars 2024";

  return (
    <div className="pt-16 pb-32 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>Politique de confidentialité - Taste Nantes</title>
        <meta
          name="description"
          content="Politique de confidentialité de Taste Nantes - Comment nous protégeons vos données personnelles."
        />
      </Head>

      <div className="dior-container max-w-4xl mx-auto px-4">
        <AnimatedSection>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Politique de confidentialité
          </motion.h1>

          <motion.div
            className="w-20 h-1 bg-pink-600 mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          <motion.p
            className="text-center text-gray-600 max-w-2xl mx-auto mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Chez Taste Nantes, nous accordons une grande importance à la
            protection de vos données personnelles. Cette politique de
            confidentialité explique comment nous collectons, utilisons et
            protégeons vos informations.
          </motion.p>

          <motion.p
            className="text-center text-gray-500 text-sm mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Dernière mise à jour : {lastUpdated}
          </motion.p>
        </AnimatedSection>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <AnimatedSection delay={0.2}>
            <PolicySection
              title="Collecte des données"
              icon={
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            >
              <p>
                Nous collectons les informations que vous nous fournissez
                directement lorsque vous :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Créez un compte sur notre plateforme</li>
                <li>Remplissez un formulaire de contact</li>
                <li>Vous inscrivez à notre newsletter</li>
                <li>Interagissez avec nos services</li>
              </ul>
              <p>
                Ces informations peuvent inclure votre nom, adresse email,
                numéro de téléphone et préférences culinaires.
              </p>
            </PolicySection>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <PolicySection
              title="Utilisation des données"
              icon={
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            >
              <p>Nous utilisons vos données personnelles pour :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Fournir, maintenir et améliorer nos services</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Communiquer avec vous concernant nos services</li>
                <li>
                  Vous envoyer des informations sur les nouveaux restaurants et
                  événements
                </li>
                <li>Assurer la sécurité de notre plateforme</li>
              </ul>
            </PolicySection>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <PolicySection
              title="Cookies et technologies similaires"
              icon={
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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              }
            >
              <p>
                Nous utilisons des cookies et technologies similaires pour
                améliorer votre expérience sur notre site, analyser comment nos
                services sont utilisés et personnaliser le contenu.
              </p>
              <p>
                Vous pouvez configurer votre navigateur pour refuser tous les
                cookies ou pour indiquer quand un cookie est envoyé. Cependant,
                certaines fonctionnalités de notre service pourraient ne pas
                fonctionner correctement sans cookies.
              </p>
            </PolicySection>
          </AnimatedSection>

          <AnimatedSection delay={0.5}>
            <PolicySection
              title="Partage des données"
              icon={
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              }
            >
              <p>
                Nous ne vendons pas vos données personnelles à des tiers. Nous
                pouvons partager vos informations dans les situations suivantes
                :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Avec votre consentement</li>
                <li>
                  Avec nos prestataires de services qui nous aident à fournir
                  nos services
                </li>
                <li>Pour se conformer à des obligations légales</li>
                <li>Pour protéger nos droits et ceux de nos utilisateurs</li>
              </ul>
            </PolicySection>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <PolicySection
              title="Sécurité des données"
              icon={
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            >
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour
                protéger vos données personnelles contre tout accès non
                autorisé, altération, divulgation ou destruction.
              </p>
              <p>
                Cependant, aucune méthode de transmission sur Internet ou de
                stockage électronique n'est totalement sécurisée. Nous ne
                pouvons donc pas garantir une sécurité absolue.
              </p>
            </PolicySection>
          </AnimatedSection>

          <AnimatedSection delay={0.7}>
            <PolicySection
              title="Vos droits"
              icon={
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            >
              <p>
                Conformément aux lois applicables sur la protection des données,
                vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, veuillez nous contacter via notre{" "}
                <Link href="/contact" className="text-pink-600 hover:underline">
                  formulaire de contact
                </Link>
                .
              </p>
            </PolicySection>
          </AnimatedSection>

          <AnimatedSection delay={0.8}>
            <PolicySection
              title="Modifications de la politique"
              icon={
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            >
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité de
                temps à autre. Nous vous informerons de tout changement
                significatif par email ou par une notification sur notre site.
              </p>
              <p>
                Nous vous encourageons à consulter régulièrement cette page pour
                rester informé des dernières mises à jour.
              </p>
            </PolicySection>
          </AnimatedSection>

          <AnimatedSection delay={0.9}>
            <PolicySection
              title="Contact"
              icon={
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            >
              <p>
                Si vous avez des questions concernant cette politique de
                confidentialité, veuillez nous contacter :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Par email :{" "}
                  <span className="text-pink-600">privacy@tastenantes.fr</span>
                </li>
                <li>
                  Via notre{" "}
                  <Link
                    href="/contact"
                    className="text-pink-600 hover:underline"
                  >
                    formulaire de contact
                  </Link>
                </li>
              </ul>
            </PolicySection>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={1.0} className="mt-16 text-center">
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
