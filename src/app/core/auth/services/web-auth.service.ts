import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const API_URL = environment.apiUrl;

interface WebUser {
  id: string;
  email: string;
  full_name: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebAuthService {
  private userSubject = new BehaviorSubject<WebUser | null>(null);
  user$ = this.userSubject.asObservable();

  private readonly TOKEN_KEY = 'web_auth_token';

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.verifyToken(token);
    }
  }

  private verifyToken(token: string) {
    this.http.post<any>(`${API_URL}/auth/verify.php`, { token }).subscribe({
      next: (response) => {
        if (response.success) {
          this.userSubject.next({
            ...response.data,
            token
          });
        } else {
          this.signOut();
        }
      },
      error: () => this.signOut()
    });
  }

  register(email: string, password: string, fullName: string): Observable<WebUser> {
    return this.http.post<any>(`${API_URL}/auth/register.php`, {
      email,
      password,
      full_name: fullName
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        const user = response.data;
        this.userSubject.next(user);
        localStorage.setItem(this.TOKEN_KEY, user.token);
        this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/store']);
        return user;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        this.snackBar.open(error.message || 'Registration failed', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/auth/reset-password.php`, { email }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Password reset instructions sent to your email', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Password reset error:', error);
        this.snackBar.open(error.message || 'Password reset failed', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  signIn(email: string, password: string): Observable<WebUser> {
    return this.http.post<any>(`${API_URL}/auth/login.php`, {
      email,
      password
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        const user = response.data;
        this.userSubject.next(user);
        localStorage.setItem(this.TOKEN_KEY, user.token);
        this.snackBar.open('Successfully logged in', 'Close', { duration: 3000 });
        this.router.navigate(['/store']);
        return user;
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  signOut(): Observable<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return this.http.post<any>(`${API_URL}/auth/logout.php`, { token }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        localStorage.removeItem(this.TOKEN_KEY);
        this.userSubject.next(null);
        this.router.navigate(['/']);
        this.snackBar.open('Successfully logged out', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.snackBar.open(error.message || 'Logout failed', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getCurrentUser(): Observable<WebUser | null> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return new Observable(obs => obs.next(null));
    }

    return this.http.post<any>(`${API_URL}/auth/verify.php`, { token }).pipe(
      map(response => response.success ? response.data : null)
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }

  updateProfile(userId: string, data: any): Observable<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${API_URL}/auth/update-profile.php`, data, { headers }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Profile update error:', error);
        this.snackBar.open(error.message || 'Profile update failed', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}