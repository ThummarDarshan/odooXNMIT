export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'New' | 'Like New' | 'Used';
  imageUrl: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    isVerified: boolean;
  };
  year?: number;
  brand?: string;
  dimensions?: string;
  weight?: string;
  material?: string;
  hasWarranty?: boolean;
  hasManual?: boolean;
  quantity: number;
  isEcoFriendly?: boolean;
  sustainabilityScore?: number;
}
export interface User {
  id: string;
  displayName: string;
  email: string;
  profileImage: string;
}
export interface Purchase {
  id: string;
  product: Product;
  purchaseDate: string;
  quantity: number;
}