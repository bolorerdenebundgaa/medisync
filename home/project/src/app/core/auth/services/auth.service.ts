import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );

    // Check current session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.userSubject.next(session?.user ?? null);
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) throw error;

      if (data.user) {
        this.snackBar.open('Successfully logged in', 'Close', { duration: 3000 });
        this.router.navigate(['/inventory']);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      
      this.router.navigate(['/login']);
      this.snackBar.open('Successfully logged out', 'Close', { duration: 3000 });
    } catch (error: any) {
      console.error('Logout error:', error);
      this.snackBar.open('Logout failed', 'Close', { duration: 3000 });
    }
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
}