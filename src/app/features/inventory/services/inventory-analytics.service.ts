import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface InventoryAnalyticsSummary {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  active_products: number;
}

export interface InventoryAnalyticsProduct {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  total_sold: number;
  transaction_count: number;
  turnover_rate: number;
  first_sale: string;
  last_sale: string;
}

export interface InventoryAnalytics {
  summary: InventoryAnalyticsSummary;
  products: InventoryAnalyticsProduct[];
}

@Injectable({
  providedIn: 'root'
})
export class InventoryAnalyticsService {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  getInventoryAnalytics(branchId: string, days: number = 30): Observable<InventoryAnalytics> {
    return from(
      this.authService.supabase.rpc('get_inventory_analytics', {
        p_branch_id: branchId,
        p_days: days
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data) throw new Error('No data returned from analytics');
        return data as InventoryAnalytics;
      }),
      catchError(error => {
        console.error('Error loading inventory analytics:', error);
        this.snackBar.open('Error loading inventory analytics', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  generateForecast(productId: string, branchId: string, days: number = 30): Observable<void> {
    return from(
      this.authService.supabase.rpc('generate_inventory_forecast', {
        p_product_id: productId,
        p_branch_id: branchId,
        p_days: days
      })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        this.snackBar.open('Forecast generated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error generating forecast:', error);
        this.snackBar.open('Error generating forecast', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}