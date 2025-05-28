import { inject } from "@angular/core";
import { HttpInterceptorFn, HttpErrorResponse, HttpEvent } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";
import { catchError, throwError, tap } from "rxjs";
import { Observable } from "rxjs/internal/Observable";

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (request.url.includes('/auth/')) {
    return next(request);
  }
  
  const token = auth.getToken();

  
  if (token) {
    const authRequest = request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
    
   
    
    
    return next(authRequest).pipe(
      tap({
        next: (response: HttpEvent<any>) => {
          console.log('AuthInterceptor - Request successful:', response);
        },
        error: (error: any) => {
          console.error('AuthInterceptor - Request failed:', error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthInterceptor - HTTP Error:', {
          url: error.url,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          headers: Object.fromEntries(error.headers.keys().map(k => [k, error.headers.get(k)]))
        });
        
        if (error.status === 401) {
          console.log('AuthInterceptor - 401 Unauthorized - token might be expired or invalid');
          auth.logout();
          router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  } else {
    console.warn('AuthInterceptor - No token available for request to:', request.url);
    return next(request);
  }
};
