import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

const API_URL = 'https://medisync.solutions/api';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/users/list.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/admin/users/create.php`, userData).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating user:', error);
        this.snackBar.open('Error creating user', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateUserRoles(userId: string, roleIds: string[], branchId?: string): Observable<void> {
    return this.http.put<any>(`${API_URL}/admin/users/update-roles.php`, {
      user_id: userId,
      role_ids: roleIds,
      branch_id: branchId
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User roles updated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error updating user roles:', error);
        this.snackBar.open('Error updating user roles', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateUserRole(userId: string, roleId: string, branchId?: string): Observable<void> {
    return this.http.put<any>(`${API_URL}/admin/users/update-role.php`, {
      user_id: userId,
      role_id: roleId,
      branch_id: branchId
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User role updated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error updating user role:', error);
        this.snackBar.open('Error updating user role', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<any>(`${API_URL}/admin/users/delete.php`, { body: { id } }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error deleting user:', error);
        this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}