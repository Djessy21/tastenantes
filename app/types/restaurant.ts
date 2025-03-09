export interface Location {
  lat: number;
  lng: number;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  rating: number;
  location: Location;
  website?: string;
  instagram?: string;
}

export interface CertifiedRestaurant extends Restaurant {
  description?: string;
  phone?: string;
  email?: string;
  image?: string;
  priceRange?: string;
  openingHours?: string;
  dishes: Dish[];
  featured: boolean;
  specialNote?: string;
  certifiedBy: string;
  certificationDate: string;
  createdAt: string;
  updatedAt?: string;
  website?: string;
  instagram?: string;
}
