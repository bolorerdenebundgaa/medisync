import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
const API_URL = 'https://medisync.solutions/api';


interface AdminUser {
  id: string;
  email: string;
  role: string;
  token: string;
}
@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private adminSubject = new BehaviorSubject<AdminUser | null>(null);
  admin$ = this.adminSubject.asObservable();

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
    this.http.post(`${API_URL}/admin/auth/verify.php`, { token }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.adminSubject.next({
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

  async register(email: string, password: string, fullName: string): Promise<void> {
    try {
      const response = await this.http.post<any>(`${API_URL}/admin/auth/register.php`, {
        email,
        password,
        full_name: fullName
      }).toPromise();

      if (!response.success) throw new Error(response.message);

      this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
      await this.signIn(email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      this.snackBar.open(error.message || 'Registration failed', 'Close', { duration: 3000 });
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const response = await this.http.post<any>(`${API_URL}/admin/auth/login.php`, {
        email: email.trim(),
        password: password.trim()
      }).toPromise();

      if (!response.success) throw new Error(response.message);

      const { data } = response;
      this.adminSubject.next(data);
      localStorage.setItem('admin_token', data.token);
      this.snackBar.open('Successfully logged in', 'Close', { duration: 3000 });
      this.router.navigate(['/admin/dashboard']);
    } catch (error: any) {
      console.error('Admin auth error:', error);
      this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        await this.http.post(`${API_URL}/admin/auth/logout.php`, { token }).toPromise();
      }
      localStorage.removeItem('admin_token');
      this.adminSubject.next(null);
      this.router.navigate(['/admin/login']);
      this.snackBar.open('Successfully logged out', 'Close', { duration: 3000 });
    } catch (error: any) {
      console.error('Logout error:', error);
      this.snackBar.open('Logout failed', 'Close', { duration: 3000 });
    }
  }

  isAdmin(): Observable<boolean> {
    return this.admin$.pipe(
      map(user => !!user)
    );
  }
}