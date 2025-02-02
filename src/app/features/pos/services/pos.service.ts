import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Client } from '../../../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class PosService {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  searchReferees(query: string): Observable<any[]> {
    return from(
      this.authService.supabase
        .from('user_roles')
        .select(`
          auth_user:user_id (
            id,
            email,
            raw_user_meta_data
          ),
          role:role_id (name)
        `)
        .eq('role.name', 'referee')
    ).pipe(
      map(({ data }) => {
        if (!data) return [];
        return data.map(item => ({
          id: item.auth_user.id,
          email: item.auth_user.email,
          full_name: item.auth_user.raw_user_meta_data?.full_name || item.auth_user.email
        })).filter(referee => 
          referee.full_name.toLowerCase().includes(query.toLowerCase()) ||
          referee.email.toLowerCase().includes(query.toLowerCase())
        );
      }),
      catchError(error => {
        console.error('Error searching referees:', error);
        this.snackBar.open('Error searching referees', 'Close', { duration: 3000 });
        return of([]);
      })
    );
  }

  // ... rest of the service code remains the same
}