import { sql } from "@vercel/postgres";

export async function addWebsiteInstagramColumns() {
  try {
    console.log(
      "Vérification de l'existence des colonnes website et instagram..."
    );

    // Vérifier si les colonnes existent déjà
    const checkColumnsResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      AND column_name IN ('website', 'instagram');
    `;

    const existingColumns = checkColumnsResult.rows.map(
      (row) => row.column_name
    );

    // Ajouter la colonne website si elle n'existe pas
    if (!existingColumns.includes("website")) {
      console.log("Ajout de la colonne website à la table restaurants...");
      await sql`ALTER TABLE restaurants ADD COLUMN website VARCHAR(255);`;
      console.log("Colonne website ajoutée avec succès.");
    } else {
      console.log("La colonne website existe déjà.");
    }

    // Ajouter la colonne instagram si elle n'existe pas
    if (!existingColumns.includes("instagram")) {
      console.log("Ajout de la colonne instagram à la table restaurants...");
      await sql`ALTER TABLE restaurants ADD COLUMN instagram VARCHAR(255);`;
      console.log("Colonne instagram ajoutée avec succès.");
    } else {
      console.log("La colonne instagram existe déjà.");
    }

    return { success: true, message: "Migration terminée avec succès" };
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    return { success: false, error };
  }
}
