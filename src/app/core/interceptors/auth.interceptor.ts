import { HttpInterceptorFn } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get stored token
  const token = localStorage.getItem('admin_token');

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

    return next(authReq);
  }

  // If no token, proceed with original request
  return next(req);
};