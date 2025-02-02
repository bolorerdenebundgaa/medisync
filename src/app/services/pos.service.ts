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
export class PosService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  searchReferees(query: string): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/referees/search.php`, {
      params: { query }
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error searching referees:', error);
        this.snackBar.open('Error searching referees', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  searchClients(query: string): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/clients/search.php`, {
      params: { query }
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error searching clients:', error);
        this.snackBar.open('Error searching clients', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}