import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebAuthService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );

    this.supabase.auth.onAuthStateChange((_, session) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  register(email: string, password: string, fullName: string): Observable<User> {
    return from(
      this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'web'
          }
        }
      })
    ).pipe(
      map(({ data: { user }, error }) => {
        if (error) throw error;
        if (!user) throw new Error('Registration failed');
        
        this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
        return user;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        this.snackBar.open(error.message || 'Registration failed', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  signIn(email: string, password: string): Observable<User> {
    return from(
      this.supabase.auth.signInWithPassword({
        email,
        password
      })
    ).pipe(
      map(({ data: { user }, error }) => {
        if (error) throw error;
        if (!user) throw new Error('Login failed');

        this.snackBar.open('Successfully logged in', 'Close', { duration: 3000 });
        return user;
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  signOut(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      map(() => {
        this.userSubject.next(null);
        this.router.navigate(['/']);
        this.snackBar.open('Successfully logged out', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Logout error:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    return from(this.supabase.auth.getUser()).pipe(
      map(({ data: { user } }) => user)
    );
  }

  updateProfile(userId: string, data: any): Observable<void> {
    return from(
      this.supabase
        .from('web_users')
        .update(data)
        .eq('auth_id', userId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Profile update error:', error);
        this.snackBar.open(error.message || 'Profile update failed', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }
}