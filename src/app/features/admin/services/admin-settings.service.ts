import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

const API_URL = 'https://medisync.solutions/api';

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {
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

  updateSettings(settings: Record<string, number>): Observable<void> {
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