-- Création de la table Role
CREATE TABLE IF NOT EXISTS "Role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  PRIMARY KEY ("id")
);

-- Création de la table User
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "password" TEXT,
  "image" TEXT,
  "roleId" TEXT NOT NULL DEFAULT 'user',
  PRIMARY KEY ("id"),
  CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Création de la table Account
CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  PRIMARY KEY ("id"),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Création de la table Session
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Création de la table VerificationToken
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

-- Création des index uniques
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Insertion des rôles par défaut
INSERT INTO "Role" ("id", "name", "description")
VALUES 
  ('admin', 'Administrateur', 'Accès complet à toutes les fonctionnalités'),
  ('user', 'Utilisateur', 'Accès en lecture seule')
ON CONFLICT DO NOTHING;

-- Insertion d'un utilisateur administrateur par défaut (mot de passe: Admin123!)
-- Note: Dans une application réelle, vous devriez hacher le mot de passe avant de l'insérer
INSERT INTO "User" ("id", "name", "email", "password", "roleId")
VALUES 
  ('cluser123456', 'Admin', 'admin@tastenantes.fr', '$2b$10$rQYuF9.3ZUrhvQKpgfjzR.YZT1/Mcr4Rj5hYqaVs7QhPo0qz2vZbO', 'admin')
ON CONFLICT DO NOTHING; 