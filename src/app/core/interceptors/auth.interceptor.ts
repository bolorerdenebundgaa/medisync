import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(environment.auth.tokenKey);

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Clear auth data and redirect to login
          localStorage.removeItem(environment.auth.tokenKey);
          localStorage.removeItem(environment.auth.refreshTokenKey);
          localStorage.removeItem(environment.auth.userKey);
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

// Export a factory function to create the interceptor
export function authInterceptorFactory(router: Router) {
  return new AuthInterceptor(router);
}
