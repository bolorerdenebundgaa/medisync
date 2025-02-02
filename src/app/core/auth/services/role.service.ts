import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  checkUserRole(userId: string, roleName: string): Observable<boolean> {
    return this.http.get<any>(`${API_URL}/admin/roles/check.php`, {
      params: { user_id: userId, role_name: roleName }
    }).pipe(
      map(response => response.success),
      catchError(error => {
        console.error('Error checking role:', error);
        this.snackBar.open('Error checking role', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/roles/list.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading roles:', error);
        this.snackBar.open('Error loading roles', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}