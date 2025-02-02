export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: PaymentMethodType;
  enabled: boolean;
  icon?: string;
  processorConfig?: {
    apiKey?: string;
    merchantId?: string;
    endpoint?: string;
  };
}

export enum PaymentMethodType {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MOBILE_PAYMENT = 'mobile_payment',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto'
}

export interface PaymentMethodState {
  methods: PaymentMethodConfig[];
  defaultMethod?: string;
  lastUpdated?: Date;
}

export interface PaymentMethodUpdateRequest {
  methodId: string;
  updates: Partial<PaymentMethodConfig>;
}

export interface PaymentMethodResponse {
  success: boolean;
  data?: PaymentMethodConfig[];
  message?: string;
}
