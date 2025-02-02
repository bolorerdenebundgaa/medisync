import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface SaleRequest {
  items: SaleItem[];
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  client_id?: string;
  referee_id?: string;
  prescription_id?: string;
  payment_method?: string;
}

export interface Sale {
  id: string;
  branch_id: string;
  client_id?: string;
  referee_id?: string;
  prescription_id?: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_by: string;
  created_at: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export interface SaleResponse {
  success: boolean;
  message?: string;
  data: Sale;
}

@Injectable({
  providedIn: 'root'
})
export class PosService {
  private readonly API_URL = `${environment.apiUrl}/pos`;

  constructor(private http: HttpClient) {}

  createSale(sale: SaleRequest): Observable<Sale> {
    return this.http.post<SaleResponse>(`${this.API_URL}/create-sale.php`, sale)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to create sale');
        }
        return response.data;
      }));
  }

  getSale(id: string): Observable<Sale> {
    return this.http.get<SaleResponse>(`${this.API_URL}/get-sale.php?id=${id}`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to get sale');
        }
        return response.data;
      }));
  }

  getSales(params: {
    start_date?: string;
    end_date?: string;
    client_id?: string;
    referee_id?: string;
  } = {}): Observable<Sale[]> {
    return this.http.get<{success: boolean; data: Sale[]}>(`${this.API_URL}/list-sales.php`, { params })
      .pipe(map(response => {
        if (!response.success) {
          throw new Error('Failed to get sales');
        }
        return response.data;
      }));
  }

  voidSale(id: string, reason: string): Observable<void> {
    return this.http.post<{success: boolean; message?: string}>(`${this.API_URL}/void-sale.php`, { id, reason })
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to void sale');
        }
      }));
  }

  getDailySummary(): Observable<{
    total_sales: number;
    total_amount: number;
    total_vat: number;
    sale_count: number;
    top_products: {
      product_id: string;
      product_name: string;
      quantity: number;
      total_amount: number;
    }[];
  }> {
    return this.http.get<{success: boolean; data: any}>(`${this.API_URL}/daily-summary.php`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error('Failed to get daily summary');
        }
        return response.data;
      }));
  }

  getReceiptData(saleId: string): Observable<{
    sale: Sale;
    business: {
      name: string;
      address: string;
      phone: string;
      tax_number: string;
    };
    branch: {
      name: string;
      address: string;
      phone: string;
    };
  }> {
    return this.http.get<{success: boolean; data: any}>(`${this.API_URL}/receipt.php?id=${saleId}`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error('Failed to get receipt data');
        }
        return response.data;
      }));
  }
}
