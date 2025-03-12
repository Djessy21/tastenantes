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

  const coordinates = generateRandomCoordinates();

  // Sélectionner une image aléatoire dans notre liste
  const randomImage =
    restaurantImages[Math.floor(Math.random() * restaurantImages.length)];

  return {
    name: generateRandomRestaurantName(),
    address: generateRandomAddress(),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    rating: Math.floor(Math.random() * 15 + 35) / 10, // Note entre 3.5 et 5.0
    cuisine: cuisines[Math.floor(Math.random() * cuisines.length)],
    specialNote:
      establishmentTypes[Math.floor(Math.random() * establishmentTypes.length)],
    certifiedBy: `Chef ${chefs[Math.floor(Math.random() * chefs.length)]}`,
    certificationDate: new Date(),
    featured: Math.random() > 0.8, // 20% de chance d'être en vedette
    image: randomImage, // Utiliser une image constante de notre liste
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

export async function GET() {
  // Vérifier l'authentification et les droits d'admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Nombre de restaurants à générer (en plus des restaurants de test)
    const additionalRestaurants = 25;
    let totalDishes = 0;
    let restaurantsWithDishes = 0;

    // Ajouter les restaurants de test
    for (const restaurant of testRestaurants) {
      const createdRestaurant = await prisma.restaurant.create({
        data: restaurant,
      });

      // 70% de chance d'ajouter des plats à ce restaurant
      if (Math.random() < 0.7) {
        const dishesAdded = await addDishesToRestaurant(
          createdRestaurant.id,
          restaurant.cuisine
        );
        totalDishes += dishesAdded;
        restaurantsWithDishes++;
      }
    }

    // Ajouter des restaurants générés aléatoirement
    for (let i = 0; i < additionalRestaurants; i++) {
      const randomRestaurant = generateRandomRestaurant();
      const createdRestaurant = await prisma.restaurant.create({
        data: randomRestaurant,
      });

      // 50% de chance d'ajouter des plats à ce restaurant
      if (Math.random() < 0.5) {
        const dishesAdded = await addDishesToRestaurant(
          createdRestaurant.id,
          randomRestaurant.cuisine
        );
        totalDishes += dishesAdded;
        restaurantsWithDishes++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${
        testRestaurants.length + additionalRestaurants
      } restaurants ont été ajoutés avec succès. ${totalDishes} plats ont été ajoutés à ${restaurantsWithDishes} restaurants.`,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout des restaurants:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout des restaurants" },
      { status: 500 }
    );
  }
}
