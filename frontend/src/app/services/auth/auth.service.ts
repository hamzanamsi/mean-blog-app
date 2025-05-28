import { Injectable, inject, signal } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, catchError, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environments";
import { Role, User } from "../../models/blog.models";

const TOKEN_KEY = 'blog_token';
const USER_KEY = 'blog_user';

// function hasAdminRole(user: User | null): boolean {
//   if (!user) return false;
  
//   if (user.role === 'admin') return true;
  
//   if (user.roles) {
//     return user.roles.some(role => 
//       (typeof role === 'string' && role === 'admin') || 
//       (role && typeof role === 'object' && 'name' in role && role.name === 'admin')
//     );
//   }
  
//   return false;
// }

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  apiUrl = environment.apiUrl;
  loading = signal(false);
  user = signal<User | null>(null);
  user$ = this.user.asReadonly();

  constructor() {
    this.loadUser();
  }

  login(
    email: string,
    password: string
  ): Observable<{ token: string; user: User }> {
    this.loading.set(true);
    return this.http
      .post<{ token: string; user: User }>(`${this.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap({
          next: (res) => {
            if (res.token && res.user) {
              this.setToken(res.token);
              this.setUser(res.user);
            } else {
              console.error('Login response missing token or user:', res);
            }
          },
          error: (error) => {
            console.error('Login error:', error);
            throw error;
          },
          finalize: () => this.loading.set(false)
        }),
        catchError(this.handleError.bind(this))
      );
  }

  register(data: {
    username: string;
    email: string;
    password: string;
    adminCode?: string;
  }): Observable<{ token: string; user: User }> {
    this.loading.set(true);
    return this.http
      .post<{ token: string; user: User }>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap({
          next: (res) => {
            if (res.token && res.user) {
              this.setToken(res.token);
              this.setUser(res.user);
            }
          },
          error: (error) => {
            console.error('Registration error:', error);
            throw error;
          },
          finalize: () => this.loading.set(false)
        }),
        catchError(this.handleError.bind(this))
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        if (tokenPayload.exp * 1000 > Date.now()) {
          return token;
        }
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  currentUser() {
    return this.user();
  }

  private setToken(token: string): void {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      console.warn('Attempted to set a null or undefined token');
    }
  }

  private checkAdmin(user: User | null): boolean {
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (user.roles) {
      return user.roles.some(role => {
        if (typeof role === 'string') {
          return role === 'admin';
        } else if (role && typeof role === 'object' && 'name' in role) {
          return role.name === 'admin';
        }
        return false;
      });
    }
    
    return false;
  }

  private setUser(user: User | null): void {
    
    if (user) {
      const normalizedUser: User = { ...user };
      
      if (!normalizedUser.roles) {
        normalizedUser.roles = [];
      }
      
      if (user.role && !normalizedUser.roles.some(r => 
        (typeof r === 'string' && r === user.role) || 
        (r && typeof r === 'object' && 'name' in r && r.name === user.role)
      )) {
        normalizedUser.roles.push({ _id: '', name: user.role });
      }
      
      if (normalizedUser.roles.length === 0) {
        normalizedUser.roles.push({ _id: '', name: 'user' });
        normalizedUser.role = 'user';
      } else if (!normalizedUser.role) {
        const firstRole = normalizedUser.roles[0];
        normalizedUser.role = typeof firstRole === 'string' ? firstRole : firstRole.name;
      }
      
      this.user.set(normalizedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } else {
      this.user.set(null);
      localStorage.removeItem(USER_KEY);
    }
  }

  loadUser(): Observable<User | null> {
    return new Observable<User | null>(subscriber => {
      const token = this.getToken();
      const userData = localStorage.getItem(USER_KEY);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.user.set(user);
          subscriber.next(user);
        } catch (e) {
          console.error('Failed to parse user data from localStorage', e);
          this.clearAuthData();
          subscriber.next(null);
        }
      } else {
        subscriber.next(null);
      }
      
      if (token) {
        this.verifyToken().subscribe({
          next: (user) => {
            this.setUser(user);
            subscriber.next(user);
          },
          error: (error) => {
            console.error('Token verification failed:', error);
            this.clearAuthData();
            subscriber.next(null);
          },
          complete: () => {
            subscriber.complete();
          }
        });
      } else {
        subscriber.complete();
      }
    });
  }
  
  private verifyToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        if (user) {
          if (user.roles && user.roles.length > 0 && !user.role) {
            user.role = user.roles[0].name as 'user' | 'admin';
          } else if (!user.role) {
            user.role = 'user';
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error verifying token:', error);
        if (error.status === 401) {
          this.clearAuthData();
        }
        return throwError(() => error);
      })
    );
  }
  
  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }
  
  private handleError(error: HttpErrorResponse) {
    console.error('Auth Error:', error);
    return throwError(() => error);
  }
}
