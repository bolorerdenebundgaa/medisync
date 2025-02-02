import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

export interface PaymentSettings {
  stripe_public_key: string;
  stripe_secret_key: string;
  stripe_enabled: boolean;
  cash_enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentSettingsService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getPaymentSettings(): Observable<PaymentSettings> {
    return this.http.get<any>(`${API_URL}/admin/settings/payment.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading payment settings:', error);
        this.snackBar.open('Error loading payment settings', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updatePaymentSettings(settings: PaymentSettings): Observable<void> {
    return this.http.put<any>(`${API_URL}/admin/settings/payment.php`, settings).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Payment settings updated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error updating payment settings:', error);
        this.snackBar.open('Error updating payment settings', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}