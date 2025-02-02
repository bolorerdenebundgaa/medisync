import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  branch_id?: string;
  permissions?: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  private loadUser(): void {
    const userData = localStorage.getItem(environment.auth.userKey);
    if (userData) {
      try {
        this.userSubject.next(JSON.parse(userData));
      } catch {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login.php`, {
      email,
      password
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Login failed');
        }
        
        localStorage.setItem(environment.auth.tokenKey, response.data.token);
        localStorage.setItem(environment.auth.userKey, JSON.stringify(response.data.user));
        this.userSubject.next(response.data.user);
        
        return response.data.user;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/logout.php`, {}).pipe(
      tap(() => this.clearAuth()),
      map(() => void 0)
    );
  }

  register(userData: {
    email: string;
    password: string;
    full_name: string;
  }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register.php`, userData).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Registration failed');
        }
        return response.data.user;
      })
    );
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/update-profile.php`, updates).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Update failed');
        }
        
        const updatedUser = response.data.user;
        localStorage.setItem(environment.auth.userKey, JSON.stringify(updatedUser));
        this.userSubject.next(updatedUser);
        
        return updatedUser;
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/reset-password.php`, { email }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Password reset failed');
        }
      })
    );
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/verify.php`, { token }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Email verification failed');
        }
      })
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(environment.auth.refreshTokenKey);
    if (!refreshToken) {
      return of('');
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token.php`, {
      refresh_token: refreshToken
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Token refresh failed');
        }
        
        localStorage.setItem(environment.auth.tokenKey, response.data.token);
        return response.data.token;
      }),
      catchError(() => {
        this.clearAuth();
        return of('');
      })
    );
  }

  hasPermission(userId: string, resource: string, action: string): Observable<boolean> {
    return this.http.post<{success: boolean; data: boolean}>(`${this.API_URL}/check-permission.php`, {
      user_id: userId,
      resource,
      action
    }).pipe(
      map(response => {
        if (!response.success) {
          return false;
        }
        return response.data;
      }),
      catchError(() => of(false))
    );
  }

  private clearAuth(): void {
    localStorage.removeItem(environment.auth.tokenKey);
    localStorage.removeItem(environment.auth.refreshTokenKey);
    localStorage.removeItem(environment.auth.userKey);
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  hasRole(role: string): boolean {
    return this.userSubject.value?.role === role;
  }
}
