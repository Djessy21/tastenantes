import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Pour l'instant, nous n'avons pas encore de menus dans la base de données
    // Nous retournons un menu fictif pour tester l'interface
    const mockMenu = {
      id: 1,
      name: "Menu du jour",
      description: "Notre sélection quotidienne de plats frais et savoureux",
      isActive: true,
      slug: slug,
      restaurant: {
        id: 1,
        name: "Restaurant Test",
        address: "123 Rue de Test, Nantes",
        image: "/default-restaurant.svg",
        is_certified: true,
      },
      categories: [
        {
          id: 1,
          name: "Entrées",
          description: "Pour commencer en douceur",
          order: 1,
          menuItems: [
            {
              id: 1,
              name: "Salade César",
              description:
                "Laitue romaine, croûtons, parmesan, sauce César maison",
              price: 8.5,
              imageUrl: "/default-dish.svg",
              isAvailable: true,
              isSpecial: false,
              order: 1,
              options: [],
            },
            {
              id: 2,
              name: "Soupe à l'oignon",
              description:
                "Oignons caramélisés, bouillon de bœuf, croûtons, gruyère fondu",
              price: 7.5,
              imageUrl: "/default-dish.svg",
              isAvailable: true,
              isSpecial: true,
              order: 2,
              allergens: "Gluten, Lactose",
              options: [],
            },
          ],
        },
        {
          id: 2,
          name: "Plats",
          description: "Nos spécialités",
          order: 2,
          menuItems: [
            {
              id: 3,
              name: "Steak frites",
              description: "Entrecôte grillée, frites maison, sauce au poivre",
              price: 18.9,
              imageUrl: "/default-dish.svg",
              isAvailable: true,
              isSpecial: false,
              order: 1,
              options: [
                {
                  id: 1,
                  name: "Cuisson bleue",
                  price: 0,
                },
                {
                  id: 2,
                  name: "Cuisson saignante",
                  price: 0,
                },
                {
                  id: 3,
                  name: "Cuisson à point",
                  price: 0,
                },
                {
                  id: 4,
                  name: "Cuisson bien cuit",
                  price: 0,
                },
              ],
            },
            {
              id: 4,
              name: "Risotto aux champignons",
              description:
                "Riz arborio, champignons de saison, parmesan, huile de truffe",
              price: 16.5,
              imageUrl: "/default-dish.svg",
              isAvailable: true,
              isSpecial: true,
              order: 2,
              allergens: "Lactose",
              options: [],
            },
          ],
        },
        {
          id: 3,
          name: "Desserts",
          description: "Pour finir en beauté",
          order: 3,
          menuItems: [
            {
              id: 5,
              name: "Tiramisu",
              description: "Mascarpone, café, cacao, biscuits",
              price: 7.5,
              imageUrl: "/default-dish.svg",
              isAvailable: true,
              isSpecial: false,
              order: 1,
              allergens: "Œufs, Lactose, Gluten",
              options: [],
            },
            {
              id: 6,
              name: "Crème brûlée",
              description: "Crème vanillée, sucre caramélisé",
              price: 6.9,
              imageUrl: "/default-dish.svg",
              isAvailable: true,
              isSpecial: false,
              order: 2,
              allergens: "Œufs, Lactose",
              options: [],
            },
          ],
        },
      ],
    };

    return NextResponse.json(mockMenu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
