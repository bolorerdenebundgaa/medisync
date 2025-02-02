export interface PosItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  stock_quantity?: number;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

export interface Referee {
  id: string;
  full_name: string;
  email: string;
  commission_rate: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'mobile';
}

export interface PosTransaction {
  id?: string;
  items: PosItem[];
  customer_id?: string;
  referee_id?: string;
  payment_method: string;
  subtotal: number;
  vat_amount: number;
  referral_amount: number;
  total_amount: number;
  branch_id: string;
  created_at?: Date;
}

export interface PosState {
  selectedCustomer?: Customer;
  selectedReferee?: Referee;
  items: PosItem[];
  vatPercentage: number;
  referralPercentage: number;
  paymentMethod?: PaymentMethod;
  branchId: string;
}

export interface SearchResult<T> {
  success: boolean;
  data: T[];
  message?: string;
}
