export interface WebUser {
  id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone?: string;
  shipping_address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Cart {
  id: string;
  web_user_id: string;
  created_at: Date;
  updated_at: Date;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: string;
  product_id: string;
  web_user_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;
  user?: WebUser;
}

export interface Wishlist {
  id: string;
  web_user_id: string;
  created_at: Date;
  items?: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  product?: Product;
  created_at: Date;
}