import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, throwError, tap } from "rxjs";
import { environment } from "../../../environments/environments";
import { Role, User } from "../../models/blog.models";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

function normalizeUserForApi(user: Partial<User>): any {
  const normalized: any = { ...user };
  
  if (normalized.roles) {
    normalized.roles = normalized.roles.map((role: string | Role) => 
      typeof role === 'string' ? { name: role } : { name: role.name }
    );
  }
  else if (normalized.role) {
    normalized.roles = [{ name: normalized.role }];
  }
  
  return normalized;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = this.authService.getToken();
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('UserService - API Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
    
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    
    let errorMessage = 'Something went wrong. Please try again later.';
    if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(users => {
        const normalizedUsers = users.map(user => {
          if (user.roles && user.roles.length > 0 && !user.role) {
            user.role = user.roles[0].name;
          }
          return user;
        });
      }),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(user => {
        if (user.roles && user.roles.length > 0 && !user.role) {
          user.role = user.roles[0].name;
        }
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    
    const normalizedData = normalizeUserForApi(userData);
    
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, normalizedData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(updatedUser => {
        if (updatedUser.roles && updatedUser.roles.length > 0 && !updatedUser.role) {
          updatedUser.role = updatedUser.roles[0].name;
        }
      }),
      catchError(this.handleError)
    );
  }
}
