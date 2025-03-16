const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fonction pour générer un plat aléatoire
function generateRandomDish(cuisineType) {
  // Noms de plats par type de cuisine
  const dishNamesByCuisine = {
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
  const imageUrl =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000";

  // Sélectionner un crédit photo aléatoire
  const photoCredit = "Unsplash";

  return {
    name,
    description,
    price,
    imageUrl,
    photoCredit,
  };
}

// Fonction pour ajouter des plats à un restaurant
async function addDishesToRestaurant(restaurantId, cuisine) {
  console.log(
    `Ajout de plats au restaurant ${restaurantId} avec cuisine ${cuisine}`
  );

  // Déterminer aléatoirement le nombre de plats à ajouter (entre 3 et 8)
  const numberOfDishes = Math.floor(Math.random() * 6) + 3;
  console.log(`Nombre de plats à ajouter: ${numberOfDishes}`);

  // Générer et ajouter les plats
  try {
    for (let i = 0; i < numberOfDishes; i++) {
      const dish = generateRandomDish(cuisine);
      console.log(`Création du plat ${i + 1}/${numberOfDishes}: ${dish.name}`);

      try {
        const createdDish = await prisma.dish.create({
          data: {
            ...dish,
            restaurantId,
          },
        });
        console.log(`Plat créé avec succès: ${createdDish.id}`);
      } catch (error) {
        console.error(
          `Erreur lors de la création du plat ${dish.name}:`,
          error
        );
      }
    }

    return numberOfDishes;
  } catch (error) {
    console.error("Erreur lors de l'ajout des plats:", error);
    return 0;
  }
}

// Fonction principale
async function main() {
  try {
    // Récupérer un restaurant existant
    const restaurant = await prisma.restaurant.findFirst();

    if (!restaurant) {
      console.error("Aucun restaurant trouvé dans la base de données");
      return;
    }

    console.log(`Restaurant trouvé: ${restaurant.id} - ${restaurant.name}`);

    // Ajouter des plats au restaurant
    const dishesAdded = await addDishesToRestaurant(
      restaurant.id,
      restaurant.cuisine
    );

    console.log(
      `${dishesAdded} plats ont été ajoutés au restaurant ${restaurant.name}`
    );
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction principale
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
