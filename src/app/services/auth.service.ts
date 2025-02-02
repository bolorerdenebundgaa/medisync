import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        },
        global: {
          headers: { 'x-my-custom-header': 'inventory-management' }
        },
        db: {
          schema: 'public'
        },
        realtime: {
          timeout: 60000
        }
      }
    );

    // Check for existing session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.userSubject.next(session?.user ?? null);
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_, session) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  signIn(email: string, password: string): Observable<any> {
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      tap(({ data: { user } }) => {
        if (user) {
          this.snackBar.open('Successfully logged in', 'Close', { duration: 3000 });
          this.router.navigate(['/inventory']);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  signOut(): void {
    this.supabase.auth.signOut().then(() => {
      this.userSubject.next(null);
      this.router.navigate(['/login']);
      this.snackBar.open('Successfully logged out', 'Close', { duration: 3000 });
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }
}