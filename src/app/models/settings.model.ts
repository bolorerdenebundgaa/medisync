export interface Settings {
  id: string;
  key: string;
  value: number;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReferralEarning {
  id: string;
  referee_id: string;
  order_id: string;
  amount: number;
  percentage: number;
  created_at: Date;
}