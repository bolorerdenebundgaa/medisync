import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  getPaymentSettings(): Observable<PaymentSettings> {
    return from(
      this.authService.supabase
        .from('payment_settings')
        .select('*')
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as PaymentSettings;
      }),
      catchError(error => {
        console.error('Error loading payment settings:', error);
        this.snackBar.open('Error loading payment settings', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updatePaymentSettings(settings: PaymentSettings): Observable<void> {
    return from(
      this.authService.supabase.rpc('update_payment_settings', {
        p_settings: settings
      })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
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