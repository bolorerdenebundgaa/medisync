import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get stored token using auth service
    const token = this.authService.getAuthToken();

    if (token) {
      // Add Authorization header with Bearer token
      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cache-Control', 'no-cache');

      // Clone the request with new headers
      const authReq = req.clone({
        headers,
        withCredentials: false
      });

      return next.handle(authReq);
    }

    // If no token, proceed with original request
    return next.handle(req);
  }
}
