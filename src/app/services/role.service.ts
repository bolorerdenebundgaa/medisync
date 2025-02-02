import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role, Permission } from '../models/role.model';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getRoles(): Observable<Role[]> {
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

  getPermissions(): Observable<Permission[]> {
    return this.http.get<any>(`${API_URL}/admin/permissions/list.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading permissions:', error);
        this.snackBar.open('Error loading permissions', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<any>(`${API_URL}/admin/roles/create.php`, role).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating role:', error);
        this.snackBar.open('Error creating role', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateRole(role: Partial<Role>): Observable<Role> {
    return this.http.put<any>(`${API_URL}/admin/roles/update.php`, role).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error updating role:', error);
        this.snackBar.open('Error updating role', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateRolePermissions(roleId: string, permissionIds: string[]): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/roles/update-permissions.php`, {
      role_id: roleId,
      permission_ids: permissionIds
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Role permissions updated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error updating role permissions:', error);
        this.snackBar.open('Error updating role permissions', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<any>(`${API_URL}/admin/roles/delete.php`, { body: { id } }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error deleting role:', error);
        this.snackBar.open('Error deleting role', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}