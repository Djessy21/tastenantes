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

export async function GET() {
  // Vérifier l'authentification et les droits d'admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Nombre de restaurants à générer (en plus des restaurants de test)
    const additionalRestaurants = 25;

    // Ajouter les restaurants de test
    for (const restaurant of testRestaurants) {
      await prisma.restaurant.create({
        data: restaurant,
      });
    }

    // Ajouter des restaurants générés aléatoirement
    for (let i = 0; i < additionalRestaurants; i++) {
      const randomRestaurant = generateRandomRestaurant();
      await prisma.restaurant.create({
        data: randomRestaurant,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${
        testRestaurants.length + additionalRestaurants
      } restaurants ont été ajoutés avec succès`,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout des restaurants:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout des restaurants" },
      { status: 500 }
    );
  }
}
