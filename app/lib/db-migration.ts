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

export async function addPhotoCreditsColumns() {
  try {
    console.log("Vérification de l'existence des colonnes de crédits photo...");

    // Vérifier si les colonnes existent déjà dans la table restaurants
    const checkRestaurantColumnsResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      AND column_name = 'photo_credit';
    `;

    // Vérifier si les colonnes existent déjà dans la table dishes
    const checkDishColumnsResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dishes' 
      AND column_name = 'photo_credit';
    `;

    const restaurantColumns = checkRestaurantColumnsResult.rows.map(
      (row) => row.column_name
    );
    const dishColumns = checkDishColumnsResult.rows.map(
      (row) => row.column_name
    );

    // Ajouter la colonne photo_credit à la table restaurants si elle n'existe pas
    if (!restaurantColumns.includes("photo_credit")) {
      console.log("Ajout de la colonne photo_credit à la table restaurants...");
      await sql`ALTER TABLE restaurants ADD COLUMN photo_credit VARCHAR(255);`;
      console.log(
        "Colonne photo_credit ajoutée avec succès à la table restaurants."
      );
    } else {
      console.log(
        "La colonne photo_credit existe déjà dans la table restaurants."
      );
    }

    // Ajouter la colonne photo_credit à la table dishes si elle n'existe pas
    if (!dishColumns.includes("photo_credit")) {
      console.log("Ajout de la colonne photo_credit à la table dishes...");
      await sql`ALTER TABLE dishes ADD COLUMN photo_credit VARCHAR(255);`;
      console.log(
        "Colonne photo_credit ajoutée avec succès à la table dishes."
      );
    } else {
      console.log("La colonne photo_credit existe déjà dans la table dishes.");
    }

    return {
      success: true,
      message: "Migration des crédits photo terminée avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la migration des crédits photo:", error);
    return { success: false, error };
  }
}
