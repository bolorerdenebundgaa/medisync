export interface PosState {
  selectedClient?: any;
  selectedReferee?: any;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  vatPercentage: number;
  referralPercentage: number;
}