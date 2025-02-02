import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    const userData = this.getUserFromStorage();
    if (token && userData) {
      this.userSubject.next(userData);
    }
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login.php`, loginRequest)
      .pipe(
        tap((response: LoginResponse) => {
          if (response.success && response.data) {
            localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
            const userData: User = {
              id: response.data.id,
              email: response.data.email,
              full_name: response.data.full_name
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
            this.userSubject.next(userData);
            this.snackBar.open('Successfully logged in', 'Close', { duration: 3000 });
            this.router.navigate(['/inventory']);
          }
        }),
        catchError((error: { error?: { message: string } }) => {
          console.error('Login error:', error);
          this.snackBar.open(error.error?.message || 'Login failed', 'Close', { duration: 3000 });
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout.php`, {}).subscribe({
      next: () => this.handleLogout(),
      error: () => this.handleLogout()
    });
  }

  private handleLogout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
    this.snackBar.open('Successfully logged out', 'Close', { duration: 3000 });
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map((user: User | null) => !!user)
    );
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}
