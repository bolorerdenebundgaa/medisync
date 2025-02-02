import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
const API_URL = 'https://medisync.solutions/api';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private http: HttpClient) {}

  checkPermission(resource: string, action: string): Observable<boolean> {
    return this.http.post<any>(`${API_URL}/admin/auth/check-permission.php`, {
      resource,
      action
    }).pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  getUserPermissions(): Observable<string[]> {
    return this.http.get<any>(`${API_URL}/admin/auth/get-permissions.php`).pipe(
      map(response => response.success ? response.data : []),
      catchError(() => of([]))
    );
  }
}