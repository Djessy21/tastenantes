import { sql } from "@vercel/postgres";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  is_certified: boolean;
  rating: number;
  cuisine: string;
  special_note: string;
  certified_by: string;
  certification_date: string;
  featured: boolean;
  image?: string;
  image_url?: string;
  website?: string;
  instagram?: string;
  photo_credit?: string;
}

export interface Dish {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  created_at: string;
  photo_credit?: string;
}

export async function getRestaurants(
  page = 1,
  limit = 10
): Promise<Restaurant[]> {
  const offset = (page - 1) * limit;
  const { rows } = await sql<Restaurant>`
    SELECT * FROM restaurants 
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows;
}

export async function createRestaurant(
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  rating: number,
  cuisine: string,
  specialNote: string,
  certifiedBy: string,
  certificationDate: string,
  featured: boolean,
  image_url: string = "",
  website: string = "",
  instagram: string = "",
  photo_credit: string = ""
): Promise<Restaurant> {
  const { rows } = await sql<Restaurant>`
    INSERT INTO restaurants (
      name, 
      address, 
      latitude, 
      longitude,
      rating,
      cuisine,
      special_note,
      certified_by,
      certification_date,
      featured,
      is_certified,
      image,
      website,
      instagram,
      photo_credit
    ) VALUES (
      ${name}, 
      ${address}, 
      ${latitude}, 
      ${longitude},
      ${rating},
      ${cuisine},
      ${specialNote},
      ${certifiedBy},
      ${certificationDate},
      ${featured},
      true,
      ${image_url},
      ${website},
      ${instagram},
      ${photo_credit}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function getDishes(restaurantId: number): Promise<Dish[]> {
  const { rows } = await sql<Dish>`
    SELECT 
      d.id,
      d.restaurant_id,
      d.name,
      d.description,
      d.price,
      d.image_url,
      d.created_at,
      d.photo_credit
    FROM dishes d
    WHERE d.restaurant_id = ${restaurantId}
    ORDER BY d.created_at DESC
  `;

  return rows;
}

export async function createDish(
  restaurantId: number,
  name: string,
  description: string,
  price: number,
  imageUrl: string,
  photo_credit: string = ""
): Promise<Dish> {
  const { rows } = await sql<Dish>`
    INSERT INTO dishes (
      restaurant_id, 
      name, 
      description, 
      price,
      image_url,
      photo_credit
    ) VALUES (
      ${restaurantId}, 
      ${name}, 
      ${description}, 
      ${price},
      ${imageUrl},
      ${photo_credit}
    )
    RETURNING *
  `;
  return rows[0];
}

async function checkTableSchema() {
  try {
    const { rows } = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants'
    `;

    const requiredColumns = [
      "rating",
      "cuisine",
      "special_note",
      "certified_by",
      "certification_date",
      "featured",
    ];

    const existingColumns = rows.map((row) => row.column_name);
    const missingColumns = requiredColumns.filter(
      (col) => !existingColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      console.log("Missing columns:", missingColumns);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking table schema:", error);
    return false;
  }
}

export async function initDB() {
  try {
    console.log("DB: Début de l'initialisation de la base de données");

    // Vérifier si la table binary_images existe déjà
    const { rows: tableCheck } = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'binary_images'
      ) as exists
    `;

    const binaryImagesExists = tableCheck[0].exists;
    console.log(
      `DB: La table binary_images existe déjà? ${binaryImagesExists}`
    );

    if (!binaryImagesExists) {
      console.log("DB: Création de la table binary_images");
      // Créer une table pour stocker les images binaires
      await sql`
        CREATE TABLE IF NOT EXISTS binary_images (
          id SERIAL PRIMARY KEY,
          image_data BYTEA NOT NULL,
          image_type VARCHAR(50) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          filename VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log("DB: Table binary_images créée avec succès");
    }

    // Vérifier si les autres tables existent déjà
    const { rows: restaurantsCheck } = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurants'
      ) as exists
    `;

    const restaurantsExists = restaurantsCheck[0].exists;
    console.log(`DB: La table restaurants existe déjà? ${restaurantsExists}`);

    if (!restaurantsExists) {
      console.log("DB: Création des tables principales");
      // Supprimer les tables existantes
      await sql`DROP TABLE IF EXISTS dishes CASCADE`;
      await sql`DROP TABLE IF EXISTS restaurant_images CASCADE`;
      await sql`DROP TABLE IF EXISTS restaurants CASCADE`;

      // Créer la table restaurants avec le nouveau schéma
      await sql`
        CREATE TABLE IF NOT EXISTS restaurants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          rating NUMERIC(3,1),
          cuisine VARCHAR(100),
          special_note TEXT,
          certified_by VARCHAR(100),
          certification_date TIMESTAMP WITH TIME ZONE,
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_certified BOOLEAN DEFAULT false,
          image TEXT
        )
      `;

      // Créer la table restaurant_images
      await sql`
        CREATE TABLE IF NOT EXISTS restaurant_images (
          id SERIAL PRIMARY KEY,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          image_type VARCHAR(50) NOT NULL,
          is_main BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Créer la table dishes avec l'URL de l'image directement
      await sql`
        CREATE TABLE IF NOT EXISTS dishes (
          id SERIAL PRIMARY KEY,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price NUMERIC(10,2) NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      console.log("DB: Tables principales créées avec succès");
    }

    console.log(
      "DB: Initialisation de la base de données terminée avec succès"
    );
    return true;
  } catch (error) {
    console.error(
      "DB: Erreur lors de l'initialisation de la base de données:",
      error
    );
    throw error;
  }
}

// Fonction pour stocker une image binaire dans la base de données
export async function storeBinaryImage(
  imageData: Buffer,
  imageType: string,
  mimeType: string,
  filename: string
): Promise<number> {
  try {
    console.log(
      `DB: Début du stockage de l'image binaire de type: ${imageType}, MIME: ${mimeType}, nom: ${filename}`
    );
    console.log(`DB: Taille du buffer: ${imageData.length} bytes`);

    // Nettoyer le nom du fichier pour éviter les problèmes avec les caractères spéciaux
    const cleanFilename = filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^\x00-\x7F]/g, "") // Supprimer les caractères non-ASCII
      .replace(/[']/g, "'") // Remplacer les apostrophes typographiques par des apostrophes simples
      .replace(/[^a-zA-Z0-9.-]/g, "_"); // Remplacer les autres caractères spéciaux par des underscores

    console.log(`DB: Nom de fichier nettoyé: ${cleanFilename}`);

    // Convertir le Buffer en format hexadécimal pour PostgreSQL
    const hexData = "\\x" + imageData.toString("hex");
    console.log(`DB: Buffer converti en format hexadécimal`);

    console.log(`DB: Exécution de la requête SQL pour insérer l'image`);
    const { rows } = await sql`
      INSERT INTO binary_images (
        image_data,
        image_type,
        mime_type,
        filename
      ) VALUES (
        ${hexData}::bytea,
        ${imageType},
        ${mimeType},
        ${cleanFilename}
      )
      RETURNING id
    `;

    console.log(`DB: Image insérée avec succès, ID: ${rows[0].id}`);
    return rows[0].id;
  } catch (error) {
    console.error("DB: Erreur lors du stockage de l'image binaire:", error);
    throw error;
  }
}

// Fonction pour récupérer une image binaire par son ID
export async function getBinaryImageById(id: number): Promise<{
  image_data: Buffer;
  mime_type: string;
  filename: string;
} | null> {
  try {
    console.log(`DB: Récupération de l'image binaire avec l'ID: ${id}`);
    const { rows } = await sql`
      SELECT image_data, mime_type, filename
      FROM binary_images
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      console.log(`DB: Aucune image trouvée avec l'ID: ${id}`);
      return null;
    }

    // Convertir les données binaires en Buffer
    const row = rows[0];
    console.log(
      `DB: Image trouvée, MIME: ${row.mime_type}, nom: ${row.filename}`
    );
    return {
      image_data: Buffer.from(row.image_data),
      mime_type: row.mime_type,
      filename: row.filename,
    };
  } catch (error) {
    console.error(
      "DB: Erreur lors de la récupération de l'image binaire:",
      error
    );
    throw error;
  }
}

// Ajouter une fonction pour sauvegarder une image
export async function saveImage(
  restaurantId: number,
  imageUrl: string,
  imageType: string,
  isMain: boolean = false
): Promise<void> {
  await sql`
    INSERT INTO restaurant_images (
      restaurant_id,
      image_url,
      image_type,
      is_main
    ) VALUES (
      ${restaurantId},
      ${imageUrl},
      ${imageType},
      ${isMain}
    )
  `;
}

export async function getRestaurantById(
  id: number
): Promise<Restaurant | null> {
  try {
    const { rows } = await sql<Restaurant>`
      SELECT * FROM restaurants 
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching restaurant by ID:", error);
    throw error;
  }
}

export async function deleteRestaurant(id: number): Promise<void> {
  try {
    await sql`
      DELETE FROM restaurants 
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw error;
  }
}

export async function updateRestaurant(
  id: number,
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  cuisine: string,
  specialNote: string,
  certifiedBy: string,
  featured: boolean,
  image_url: string = "",
  website: string = "",
  instagram: string = "",
  photo_credit: string = ""
): Promise<Restaurant> {
  try {
    // Vérifier si les colonnes website, instagram et photo_credit existent
    const checkColumnsResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      AND column_name IN ('website', 'instagram', 'photo_credit');
    `;

    const existingColumns = checkColumnsResult.rows.map(
      (row) => row.column_name
    );
    const hasWebsiteColumn = existingColumns.includes("website");
    const hasInstagramColumn = existingColumns.includes("instagram");
    const hasPhotoCreditColumn = existingColumns.includes("photo_credit");

    // Construire la requête SQL en fonction des colonnes existantes
    let query;

    if (hasWebsiteColumn && hasInstagramColumn && hasPhotoCreditColumn) {
      // Toutes les colonnes existent
      query = sql<Restaurant>`
        UPDATE restaurants
        SET 
          name = ${name}, 
          address = ${address}, 
          latitude = ${latitude}, 
          longitude = ${longitude},
          cuisine = ${cuisine},
          special_note = ${specialNote},
          certified_by = ${certifiedBy},
          featured = ${featured},
          image = ${image_url},
          website = ${website},
          instagram = ${instagram},
          photo_credit = ${photo_credit},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (hasWebsiteColumn && hasInstagramColumn) {
      // Seulement website et instagram existent
      query = sql<Restaurant>`
        UPDATE restaurants
        SET 
          name = ${name}, 
          address = ${address}, 
          latitude = ${latitude}, 
          longitude = ${longitude},
          cuisine = ${cuisine},
          special_note = ${specialNote},
          certified_by = ${certifiedBy},
          featured = ${featured},
          image = ${image_url},
          website = ${website},
          instagram = ${instagram},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // Aucune des colonnes n'existe
      query = sql<Restaurant>`
        UPDATE restaurants
        SET 
          name = ${name}, 
          address = ${address}, 
          latitude = ${latitude}, 
          longitude = ${longitude},
          cuisine = ${cuisine},
          special_note = ${specialNote},
          certified_by = ${certifiedBy},
          featured = ${featured},
          image = ${image_url},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    }

    const { rows } = await query;
    return rows[0];
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
}
