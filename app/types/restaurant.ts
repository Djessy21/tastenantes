export interface Location {
  lat: number;
  lng: number;
}

export interface Dish {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  cuisine: string;
  special_note: string;
  certified_by: string;
  certification_date: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  is_certified: boolean;
  image?: string;
}

export interface CertifiedRestaurant extends Restaurant {
  certifiedBy: string;
  certificationDate: string;
  specialNote: string;
}
