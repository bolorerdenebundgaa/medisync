import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { 
  User, 
  UserWithRoles, 
  UserRegistrationRequest, 
  UserUpdateRequest,
  UserRoleUpdateRequest,
  UserResponse 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;
  private usersSubject = new BehaviorSubject<UserWithRoles[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getUsers(): Observable<UserWithRoles[]> {
    return this.http.get<UserResponse>(`${this.API_URL}/admin/users/list.php`).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        this.usersSubject.next(response.data || []);
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching users:', error);
        this.snackBar.open(error.message || 'Error fetching users', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  createUser(data: UserRegistrationRequest): Observable<User> {
    return this.http.post<UserResponse>(`${this.API_URL}/admin/users/create.php`, data).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.getUsers().subscribe(); // Refresh users list
        return response.data?.[0];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error creating user:', error);
        this.snackBar.open(error.message || 'Error creating user', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  updateUser(data: UserUpdateRequest): Observable<User> {
    return this.http.post<UserResponse>(`${this.API_URL}/admin/users/update.php`, data).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.getUsers().subscribe(); // Refresh users list
        return response.data?.[0];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error updating user:', error);
        this.snackBar.open(error.message || 'Error updating user', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  updateUserRoles(data: UserRoleUpdateRequest): Observable<User> {
    return this.http.post<UserResponse>(`${this.API_URL}/admin/users/update-role.php`, data).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User roles updated successfully', 'Close', { duration: 3000 });
        this.getUsers().subscribe(); // Refresh users list
        return response.data?.[0];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error updating user roles:', error);
        this.snackBar.open(error.message || 'Error updating user roles', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.post<UserResponse>(`${this.API_URL}/admin/users/delete.php`, { id: userId }).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.getUsers().subscribe(); // Refresh users list
      }),
      catchError((error: { message?: string }) => {
        console.error('Error deleting user:', error);
        this.snackBar.open(error.message || 'Error deleting user', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  resetPassword(userId: string, newPassword: string): Observable<void> {
    return this.http.post<UserResponse>(
      `${this.API_URL}/admin/users/reset-password.php`, 
      { id: userId, password: newPassword }
    ).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
      }),
      catchError((error: { message?: string }) => {
        console.error('Error resetting password:', error);
        this.snackBar.open(error.message || 'Error resetting password', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  getCurrentUsers(): UserWithRoles[] {
    return this.usersSubject.value;
  }

  watchUsers(): Observable<UserWithRoles[]> {
    return this.users$;
  }
}
