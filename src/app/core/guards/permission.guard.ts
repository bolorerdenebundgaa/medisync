import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PermissionService } from '../../services/permission.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredPermission = route.data['permission'];
    if (!requiredPermission) return new Observable(obs => obs.next(true));

    const [resource, action] = requiredPermission.split(':');

    return this.permissionService.checkPermission(resource, action).pipe(
      tap(hasPermission => {
        if (!hasPermission) {
          this.snackBar.open('Access denied: Insufficient permissions', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        }
      })
    );
  }
}