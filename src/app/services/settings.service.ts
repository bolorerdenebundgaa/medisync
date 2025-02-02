import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Settings {
  id?: string;
  referee_commission_percentage: number;
  vat_percentage: number;
  updated_at?: string;
}

export interface SettingsResponse {
  success: boolean;
  data: Settings;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly API_URL = `${environment.apiUrl}/admin/settings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Settings> {
    return this.http.get<SettingsResponse>(`${this.API_URL}/get.php`)
      .pipe(map(response => response.data));
  }

  updateSettings(settings: Partial<Settings>): Observable<Settings> {
    return this.http.post<SettingsResponse>(`${this.API_URL}/update.php`, settings)
      .pipe(map(response => response.data));
  }

  calculateCommission(amount: number): Observable<number> {
    return this.getSettings().pipe(
      map(settings => (amount * settings.referee_commission_percentage) / 100)
    );
  }

  calculateVAT(amount: number): Observable<number> {
    return this.getSettings().pipe(
      map(settings => (amount * settings.vat_percentage) / 100)
    );
  }

  calculateTotalWithVAT(amount: number): Observable<{
    subtotal: number;
    vat: number;
    total: number;
  }> {
    return this.getSettings().pipe(
      map(settings => {
        const vat = (amount * settings.vat_percentage) / 100;
        return {
          subtotal: amount,
          vat: vat,
          total: amount + vat
        };
      })
    );
  }

  validateSettings(settings: Partial<Settings>): string[] {
    const errors: string[] = [];

    if (settings.referee_commission_percentage !== undefined) {
      const commission = Number(settings.referee_commission_percentage);
      if (isNaN(commission)) {
        errors.push('Commission percentage must be a number');
      } else if (commission < 0 || commission > 100) {
        errors.push('Commission percentage must be between 0 and 100');
      }
    }

    if (settings.vat_percentage !== undefined) {
      const vat = Number(settings.vat_percentage);
      if (isNaN(vat)) {
        errors.push('VAT percentage must be a number');
      } else if (vat < 0 || vat > 100) {
        errors.push('VAT percentage must be between 0 and 100');
      }
    }

    return errors;
  }

  getCommissionHistory(params: {
    referee_id?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<any[]> {
    return this.http.get<{success: boolean; data: any[]}>(`${this.API_URL}/commission-history.php`, { params })
      .pipe(map(response => response.data));
  }

  getRefereeStatistics(refereeId: string): Observable<{
    total_sales: number;
    total_commission: number;
    pending_commission: number;
    paid_commission: number;
    commission_rate: number;
  }> {
    return this.http.get<{success: boolean; data: any}>(`${this.API_URL}/referee-stats.php`, {
      params: { referee_id: refereeId }
    }).pipe(map(response => response.data));
  }
}
