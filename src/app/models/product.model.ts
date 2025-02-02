export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  price: number;
  image_url: string;
  is_active: boolean;
  quantity?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSearchParams {
  [key: string]: string | number | boolean | undefined;
  category_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
  branch_id?: string;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    items: Product[];
    total: number;
    page: number;
    limit: number;
  };
}
