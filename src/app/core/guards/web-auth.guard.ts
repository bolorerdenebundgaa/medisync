import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { WebAuthService } from '../auth/services/web-auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebAuthGuard implements CanActivate {
  constructor(
    private authService: WebAuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => !!user),
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}