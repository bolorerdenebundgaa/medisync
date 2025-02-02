import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRole = route.data['role'];
    
    return this.authService.getUserRole().pipe(
      map(role => {
        if (role === requiredRole) {
          return true;
        }
        
        this.router.navigate(['/dashboard/' + role]);
        return false;
      })
    );
  }
}