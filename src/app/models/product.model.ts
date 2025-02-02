export interface ProductProperty {
  id?: string;
  product_id?: string;
  ingredients: string[];
  dosage: string;
  storage_instructions: string;
  usage_instructions: string;
  warnings: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  quantity: number;
  photo_url?: string;
  properties?: ProductProperty;
  created_at?: Date;
  updated_at?: Date;
  category_id?: string;
}