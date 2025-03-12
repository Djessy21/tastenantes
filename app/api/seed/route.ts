import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Données de test pour les restaurants
const testRestaurants = [
  {
    name: "Le Petit Gourmet",
    address: "15 Rue des Gourmands, Nantes",
    latitude: 47.21725,
    longitude: -1.55336,
    rating: 4.7,
    cuisine: "Française",
    specialNote: "Bistro",
    certifiedBy: "Chef Jean",
    certificationDate: new Date(),
    featured: Math.random() > 0.8, // 20% de chance d'être en vedette
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
    photoCredit: "Jay Wennington sur Unsplash",
    website: "https://lepetitgourmet-nantes.fr",
    instagram: "lepetitgourmet",
    description:
      "Un bistro chaleureux au cœur de Nantes proposant une cuisine française traditionnelle revisitée avec des produits locaux et de saison.",
    openingHours:
      "Lun-Ven: 12h-14h30, 19h-22h30 | Sam: 12h-15h, 19h-23h | Dim: Fermé",
    priceRange: "€€",
    phoneNumber: "02 40 12 34 56",
    is_certified: true,
  },
  {
    name: "Saveurs d'Asie",
    address: "8 Rue de l'Orient, Nantes",
    latitude: 47.21825,
    longitude: -1.55436,
    rating: 4.5,
    cuisine: "Asiatique",
    specialNote: "Restaurant",
    certifiedBy: "Chef Li",
    certificationDate: new Date(),
    featured: Math.random() > 0.8,
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000",
    photoCredit: "Sharon Chen sur Unsplash",
    website: "https://saveursdasia-nantes.com",
    instagram: "saveurs_asie",
    description:
      "Un voyage culinaire à travers l'Asie, proposant des plats authentiques de Chine, du Japon, de Thaïlande et du Vietnam.",
    openingHours: "Lun: Fermé | Mar-Dim: 12h-14h30, 19h-22h30",
    priceRange: "€€",
    phoneNumber: "02 40 23 45 67",
  },
  {
    name: "Pasta Bella",
    address: "22 Rue de l'Italie, Nantes",
    latitude: 47.21925,
    longitude: -1.55536,
    rating: 4.8,
    cuisine: "Italienne",
    specialNote: "Trattoria",
    certifiedBy: "Chef Marco",
    certificationDate: new Date(),
    featured: Math.random() > 0.8,
    image:
      "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=1000",
    photoCredit: "Brooke Lark sur Unsplash",
    website: "https://pastabella-nantes.fr",
    instagram: "pasta_bella_nantes",
    description:
      "Une authentique trattoria italienne où les pâtes sont faites maison chaque jour. Venez déguster nos spécialités dans une ambiance conviviale.",
    openingHours: "Tous les jours: 12h-14h30, 19h-23h",
    priceRange: "€€",
    phoneNumber: "02 40 34 56 78",
  },
  {
    name: "Le Jardin Vert",
    address: "5 Rue des Plantes, Nantes",
    latitude: 47.22025,
    longitude: -1.55636,
    rating: 4.6,
    cuisine: "Végétarienne",
    specialNote: "Restaurant",
    certifiedBy: "Chef Vert",
    certificationDate: new Date(),
    featured: Math.random() > 0.8,
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=1000",
  },
  {
    name: "Burger Deluxe",
    address: "12 Rue de la Viande, Nantes",
    latitude: 47.22125,
    longitude: -1.55736,
    rating: 4.4,
    cuisine: "Américaine",
    specialNote: "Burger",
    certifiedBy: "Chef Burger",
    certificationDate: new Date(),
    featured: Math.random() > 0.8,
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000",
  },
];

// Liste d'images de restaurants de haute qualité
const restaurantImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000",
  "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=1000",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=1000",
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1000",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000",
];

// Liste d'images de plats de haute qualité
const dishImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1000",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1000",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000",
];

// Fonction pour générer un nom de restaurant aléatoire
function generateRandomRestaurantName() {
  const prefixes = [
    "Le",
    "La",
    "Chez",
    "Café",
    "Bistro",
    "Restaurant",
    "Auberge",
    "Brasserie",
  ];
  const adjectives = [
    "Petit",
    "Grand",
    "Bon",
    "Délicieux",
    "Savoureux",
    "Excellent",
    "Authentique",
    "Traditionnel",
  ];
  const nouns = [
    "Gourmet",
    "Chef",
    "Table",
    "Cuisine",
    "Saveur",
    "Palais",
    "Gourmand",
    "Assiette",
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${prefix} ${adjective} ${noun}`;
}

// Fonction pour générer une adresse aléatoire à Nantes
function generateRandomAddress() {
  const numbers = Math.floor(Math.random() * 100) + 1;
  const streets = [
    "Rue de la Paix",
    "Rue du Commerce",
    "Rue des Halles",
    "Rue Crébillon",
    "Rue Boileau",
    "Rue Racine",
    "Rue Molière",
    "Rue Voltaire",
    "Rue Jean-Jacques Rousseau",
    "Rue Kervégan",
    "Rue de Strasbourg",
    "Rue de Verdun",
  ];
  const street = streets[Math.floor(Math.random() * streets.length)];

  return `${numbers} ${street}, Nantes`;
}

// Fonction pour générer des coordonnées aléatoires autour de Nantes
function generateRandomCoordinates() {
  // Coordonnées approximatives du centre de Nantes
  const centerLat = 47.21725;
  const centerLng = -1.55336;

  // Générer un décalage aléatoire (±0.01 degré, soit environ ±1km)
  const latOffset = (Math.random() - 0.5) * 0.02;
  const lngOffset = (Math.random() - 0.5) * 0.02;

  return {
    latitude: centerLat + latOffset,
    longitude: centerLng + lngOffset,
  };
}

// Fonction pour générer un restaurant aléatoire
function generateRandomRestaurant() {
  const cuisines = [
    "Française",
    "Italienne",
    "Japonaise",
    "Chinoise",
    "Indienne",
    "Mexicaine",
    "Libanaise",
    "Thaïlandaise",
    "Américaine",
    "Espagnole",
    "Grecque",
    "Marocaine",
    "Vietnamienne",
    "Coréenne",
    "Brésilienne",
    "Végétarienne",
    "Végane",
    "Fruits de mer",
    "Fusion",
  ];
  const establishmentTypes = [
    "Restaurant",
    "Pizzeria",
    "Coffee Shop",
    "Burger",
    "Fast Food",
    "Bistro",
    "Brasserie",
    "Trattoria",
    "Pub",
    "Bar à vin",
    "Crêperie",
    "Salon de thé",
    "Food Truck",
  ];
  const chefs = [
    "Jean Dupont",
    "Marie Durand",
    "Pierre Martin",
    "Sophie Bernard",
    "Thomas Petit",
    "Émilie Leroy",
    "Nicolas Moreau",
    "Camille Dubois",
  ];

  // Crédits photo pour Unsplash
  const photoCredits = [
    "Louis Hansel sur Unsplash",
    "Jay Wennington sur Unsplash",
    "Brooke Lark sur Unsplash",
    "Lily Banse sur Unsplash",
    "Jakub Kapusnak sur Unsplash",
    "Eiliv-Sonas Aceron sur Unsplash",
    "Davide Cantelli sur Unsplash",
    "Cel Lisboa sur Unsplash",
    "Toa Heftiba sur Unsplash",
    "Mahmoud Fawzy sur Unsplash",
  ];

  // Gammes de prix
  const priceRanges = ["€", "€€", "€€€", "€€€€"];

  // Modèles d'horaires d'ouverture
  const openingHoursTemplates = [
    "Lun-Ven: 12h-14h30, 19h-22h30 | Sam-Dim: 12h-15h, 19h-23h",
    "Tous les jours: 12h-14h30, 19h-23h",
    "Mar-Sam: 12h-14h, 19h-22h | Dim-Lun: Fermé",
    "Lun: Fermé | Mar-Dim: 12h-14h30, 19h-22h30",
    "Lun-Jeu: 12h-14h, 19h-22h | Ven-Dim: 12h-15h, 19h-23h",
  ];

  const coordinates = generateRandomCoordinates();
  const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
  const establishmentType =
    establishmentTypes[Math.floor(Math.random() * establishmentTypes.length)];

  // Sélectionner une image aléatoire dans notre liste
  const randomImageIndex = Math.floor(Math.random() * restaurantImages.length);
  const randomImage = restaurantImages[randomImageIndex];
  const randomPhotoCredit =
    photoCredits[Math.floor(Math.random() * photoCredits.length)];

  // Générer un nom de restaurant
  const restaurantName = generateRandomRestaurantName();

  // Créer un nom de domaine et un compte Instagram basés sur le nom du restaurant
  const domainName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const website = `https://www.${domainName}.fr`;
  const instagram = domainName.substring(0, 15);

  // Générer une description basée sur le type de cuisine et d'établissement
  const descriptions = [
    `Un ${establishmentType.toLowerCase()} chaleureux proposant une délicieuse cuisine ${cuisine.toLowerCase()} dans le centre de Nantes.`,
    `Découvrez les saveurs authentiques de la cuisine ${cuisine.toLowerCase()} dans notre ${establishmentType.toLowerCase()} convivial.`,
    `Notre ${establishmentType.toLowerCase()} vous invite à un voyage culinaire à travers les spécialités ${cuisine.toLowerCase()}.`,
    `Une adresse incontournable pour les amateurs de cuisine ${cuisine.toLowerCase()}, dans un cadre élégant et décontracté.`,
    `Savourez une cuisine ${cuisine.toLowerCase()} créative et raffinée dans notre ${establishmentType.toLowerCase()} au cœur de Nantes.`,
  ];
  const description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  // Générer un numéro de téléphone aléatoire au format français
  const phoneNumber = `02 40 ${Math.floor(
    10 + Math.random() * 90
  )} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(
    10 + Math.random() * 90
  )}`;

  // Assurez-vous que is_certified est explicitement défini à true
  return {
    name: restaurantName,
    address: generateRandomAddress(),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    rating: Math.floor(Math.random() * 15 + 35) / 10, // Note entre 3.5 et 5.0
    cuisine: cuisine,
    special_note: establishmentType,
    certified_by: `Chef ${chefs[Math.floor(Math.random() * chefs.length)]}`,
    certification_date: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
    featured: Math.random() < 0.2, // 20% de chance d'être mis en avant
    image: randomImage,
    photo_credit: randomPhotoCredit,
    website: website,
    instagram: instagram,
    description: description,
    openingHours:
      openingHoursTemplates[
        Math.floor(Math.random() * openingHoursTemplates.length)
      ],
    priceRange: priceRanges[Math.floor(Math.random() * priceRanges.length)],
    phoneNumber: phoneNumber,
    is_certified: true, // Assurez-vous que cette valeur est explicitement définie
  };
}

// Fonction pour générer un plat aléatoire
function generateRandomDish(cuisineType: string) {
  // Noms de plats par type de cuisine
  const dishNamesByCuisine: Record<string, string[]> = {
    Française: [
      "Bœuf Bourguignon",
      "Coq au Vin",
      "Ratatouille",
      "Quiche Lorraine",
      "Croque Monsieur",
      "Soupe à l'Oignon",
      "Cassoulet",
      "Blanquette de Veau",
      "Tarte Tatin",
      "Crème Brûlée",
    ],
    Italienne: [
      "Pizza Margherita",
      "Spaghetti Carbonara",
      "Lasagne",
      "Risotto aux Champignons",
      "Tiramisu",
      "Carpaccio de Bœuf",
      "Gnocchi",
      "Osso Buco",
      "Panna Cotta",
      "Bruschetta",
    ],
    Asiatique: [
      "Sushi Assortiment",
      "Pad Thaï",
      "Poulet au Curry",
      "Ramen",
      "Dim Sum",
      "Canard Laqué",
      "Bœuf Sauté",
      "Nems",
      "Riz Cantonais",
      "Mochi",
    ],
    Japonaise: [
      "Sushi Saumon",
      "Sashimi",
      "Tempura de Crevettes",
      "Yakitori",
      "Gyoza",
      "Ramen Tonkotsu",
      "Udon",
      "Okonomiyaki",
      "Takoyaki",
      "Dorayaki",
    ],
    Chinoise: [
      "Canard Laqué",
      "Porc au Caramel",
      "Nouilles Sautées",
      "Dim Sum Variés",
      "Poulet Kung Pao",
      "Bœuf à l'Orange",
      "Riz Cantonais",
      "Wonton",
      "Tofu Mapo",
      "Rouleaux de Printemps",
    ],
    Indienne: [
      "Poulet Tikka Masala",
      "Curry d'Agneau",
      "Naan au Fromage",
      "Biryani",
      "Samosas",
      "Dal Makhani",
      "Butter Chicken",
      "Pakoras",
      "Tandoori",
      "Lassi à la Mangue",
    ],
    Mexicaine: [
      "Tacos al Pastor",
      "Guacamole",
      "Enchiladas",
      "Quesadillas",
      "Chili con Carne",
      "Fajitas",
      "Nachos",
      "Burritos",
      "Mole Poblano",
      "Churros",
    ],
    Américaine: [
      "Burger Classic",
      "Ribs BBQ",
      "Mac and Cheese",
      "Buffalo Wings",
      "Hot Dog New-Yorkais",
      "Cheesecake",
      "Pancakes",
      "Pulled Pork",
      "Brownie",
      "Milkshake",
    ],
    Végétarienne: [
      "Buddha Bowl",
      "Curry de Légumes",
      "Risotto aux Champignons",
      "Falafels",
      "Salade Composée",
      "Lasagnes aux Légumes",
      "Tofu Grillé",
      "Quiche aux Épinards",
      "Burger Végétal",
      "Tarte aux Légumes",
    ],
    Végane: [
      "Bowl Protéiné",
      "Curry de Pois Chiches",
      "Pad Thaï Végétal",
      "Falafels",
      "Salade de Quinoa",
      "Burger Végétal",
      "Tofu Mariné",
      "Légumes Rôtis",
      "Houmous",
      "Dessert Cru",
    ],
    default: [
      "Plat du Jour",
      "Spécialité du Chef",
      "Assiette Gourmande",
      "Délice Maison",
      "Création Culinaire",
      "Saveur Signature",
      "Plat Traditionnel",
      "Suggestion du Chef",
      "Assiette Découverte",
      "Menu Dégustation",
    ],
  };

  // Descriptions de plats génériques
  const descriptions = [
    "Un délice préparé avec des ingrédients frais et locaux.",
    "Une recette traditionnelle revisitée par notre chef.",
    "Un plat signature qui ravira vos papilles.",
    "Une explosion de saveurs à ne pas manquer.",
    "Préparé avec amour selon une recette ancestrale.",
    "Un classique de notre cuisine, apprécié par tous nos clients.",
    "Une création originale inspirée des saveurs du monde.",
    "Un plat équilibré alliant goût et légèreté.",
    "Une spécialité maison qui fait notre renommée.",
    "Une composition harmonieuse de saveurs et de textures.",
  ];

  // Sélectionner le type de cuisine approprié ou utiliser default si non trouvé
  const dishNames =
    dishNamesByCuisine[cuisineType] || dishNamesByCuisine.default;

  // Sélectionner un nom de plat aléatoire
  const name = dishNames[Math.floor(Math.random() * dishNames.length)];

  // Sélectionner une description aléatoire
  const description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  // Générer un prix aléatoire entre 8 et 30 euros
  const price = Math.floor(Math.random() * 2200) / 100 + 8;

  // Sélectionner une image aléatoire
  const imageUrl = dishImages[Math.floor(Math.random() * dishImages.length)];

  return {
    name,
    description,
    price,
    imageUrl,
  };
}

// Fonction pour ajouter des plats à un restaurant
async function addDishesToRestaurant(restaurantId: number, cuisine: string) {
  // Déterminer aléatoirement le nombre de plats à ajouter (entre 3 et 8)
  const numberOfDishes = Math.floor(Math.random() * 6) + 3;

  // Générer et ajouter les plats
  for (let i = 0; i < numberOfDishes; i++) {
    const dish = generateRandomDish(cuisine);
    await prisma.dish.create({
      data: {
        ...dish,
        restaurantId,
      },
    });
  }

  return numberOfDishes;
}

export async function POST(request: Request) {
  try {
    console.log("[DEBUG] POST /api/seed - Début de la requête");

    // Vérifier l'état actuel de la base de données
    console.log("[DEBUG] Vérification de l'état actuel de la base de données");
    try {
      const countResult =
        await prisma.$queryRaw`SELECT COUNT(*) FROM restaurants`;
      console.log("[DEBUG] Nombre de restaurants avant seed:", countResult);
    } catch (error) {
      console.error("[DEBUG] Erreur lors du comptage des restaurants:", error);
    }

    // Restaurants de test prédéfinis
    const testRestaurants = [
      {
        name: "Le Petit Gourmet",
        address: "15 Rue des Gourmands, Nantes",
        latitude: 47.21756,
        longitude: -1.55385,
        rating: 4.8,
        cuisine: "Française",
        special_note: "Bistro",
        certified_by: "Chef Martin",
        certification_date: new Date().toISOString(),
        featured: true,
        image: "https://source.unsplash.com/random/900×700/?restaurant",
        website: "https://www.lepetitgourmet.fr",
        instagram: "lepetitgourmet",
        photo_credit: "Unsplash",
        is_certified: true,
      },
      // ... autres restaurants de test ...
    ];

    // Ajouter les restaurants de test
    console.log("[DEBUG] Ajout des restaurants de test");
    for (const restaurant of testRestaurants) {
      console.log(`[DEBUG] Création du restaurant: ${restaurant.name}`);
      try {
        const createdRestaurant = await prisma.restaurant.create({
          data: restaurant,
        });
        console.log(
          `[DEBUG] Restaurant créé avec succès: ${createdRestaurant.id}`
        );
      } catch (error) {
        console.error(
          `[DEBUG] Erreur lors de la création du restaurant ${restaurant.name}:`,
          error
        );
      }
    }

    // Ajouter des restaurants aléatoires supplémentaires
    const additionalRestaurants = 30;
    let totalDishes = 0;
    let restaurantsWithDishes = 0;

    console.log(
      `[DEBUG] Ajout de ${additionalRestaurants} restaurants aléatoires`
    );
    for (let i = 0; i < additionalRestaurants; i++) {
      const randomRestaurant = generateRandomRestaurant();
      console.log(
        `[DEBUG] Création du restaurant aléatoire: ${randomRestaurant.name}`
      );
      console.log(`[DEBUG] is_certified: ${randomRestaurant.is_certified}`);

      try {
        const createdRestaurant = await prisma.restaurant.create({
          data: randomRestaurant,
        });
        console.log(
          `[DEBUG] Restaurant aléatoire créé avec succès: ${createdRestaurant.id}`
        );
        console.log(
          `[DEBUG] is_certified dans la base: ${createdRestaurant.is_certified}`
        );

        // 50% de chance d'ajouter des plats à ce restaurant
        if (Math.random() < 0.5) {
          const dishesAdded = await addDishesToRestaurant(
            createdRestaurant.id,
            randomRestaurant.cuisine
          );
          totalDishes += dishesAdded;
          restaurantsWithDishes++;
        }
      } catch (error) {
        console.error(
          `[DEBUG] Erreur lors de la création du restaurant aléatoire:`,
          error
        );
      }
    }

    // Vérifier l'état final de la base de données
    console.log("[DEBUG] Vérification de l'état final de la base de données");
    try {
      const finalCountResult =
        await prisma.$queryRaw`SELECT COUNT(*) FROM restaurants`;
      console.log(
        "[DEBUG] Nombre de restaurants après seed:",
        finalCountResult
      );

      const certifiedCountResult =
        await prisma.$queryRaw`SELECT COUNT(*) FROM restaurants WHERE is_certified = true`;
      console.log(
        "[DEBUG] Nombre de restaurants certifiés après seed:",
        certifiedCountResult
      );
    } catch (error) {
      console.error(
        "[DEBUG] Erreur lors du comptage final des restaurants:",
        error
      );
    }

    return NextResponse.json({
      success: true,
      message: `${
        testRestaurants.length + additionalRestaurants
      } restaurants ont été ajoutés avec succès. ${totalDishes} plats ont été ajoutés à ${restaurantsWithDishes} restaurants.`,
    });
  } catch (error) {
    console.error("[DEBUG] Erreur globale lors du seed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
