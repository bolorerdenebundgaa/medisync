import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getSettings(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/settings/get.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading settings:', error);
        this.snackBar.open('Error loading settings', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateSettings(settings: { [key: string]: number }): Observable<void> {
    return this.http.put<any>(`${API_URL}/admin/settings/update.php`, settings).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Settings updated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error updating settings:', error);
        this.snackBar.open('Error updating settings', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}