export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string;
  restaurantId: number;
}

export interface CertifiedRestaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  image?: string;
  rating: number;
  priceRange: string;
  cuisine: string;
  openingHours: string;
  dishes: Dish[];
  featured: boolean;
  specialNote?: string;
  certifiedBy: string;
  certificationDate: string;
  createdAt: string;
  updatedAt: string;
}
