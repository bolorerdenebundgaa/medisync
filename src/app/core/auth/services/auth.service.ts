import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const API_URL = environment.apiUrl;

interface User {
  id: string;
  email: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    // Check for stored token
    const token = localStorage.getItem('admin_token');
    if (token) {
      this.verifyToken(token);
    }
  }

  private verifyToken(token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    this.http.post<any>(`${API_URL}/admin/auth/verify.php`, {}, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.userSubject.next({
            ...response.data,
            token
          });
          localStorage.setItem('admin_token', token);
        } else {
          this.signOut();
        }
      },
      error: () => this.signOut()
    });
  }

  signIn(email: string, password: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/auth/login.php`, {
      email: email.trim(),
      password: password
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Login failed');
        }
        
        const user = response.data;
        this.userSubject.next(user);
        localStorage.setItem('admin_token', user.token);
        this.snackBar.open('Successfully logged in', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/dashboard']);
      }),
      catchError(error => {
        console.error('Auth Error:', error);
        this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  register(email: string, password: string, fullName: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/auth/register.php`, {
      email: email.trim(),
      password,
      full_name: fullName
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Registration failed');
        }
        this.snackBar.open('Registration successful', 'Close', { duration: 3000 });
        return this.signIn(email, password);
      }),
      switchMap(signInObservable => signInObservable),
      catchError(error => {
        console.error('Registration Error:', error);
        this.snackBar.open(error.message || 'Registration failed', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  signOut(): void {
    const token = localStorage.getItem('admin_token');
    if (token) {
      this.http.post(`${API_URL}/admin/auth/logout.php`, { token }).subscribe();
    }
    localStorage.removeItem('admin_token');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
    this.snackBar.open('Successfully logged out', 'Close', { duration: 3000 });
  }

  getAuthToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }
}