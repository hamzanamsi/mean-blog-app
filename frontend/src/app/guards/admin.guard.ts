import { Injectable, inject } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Observable, map, of } from "rxjs";
import { AuthService } from "../services/auth/auth.service";
import { User } from "../models/blog.models";

@Injectable({ providedIn: "root" })
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> {
    const currentUser = this.auth.user();
    
    if (currentUser) {
      const isAdmin = this.checkAdmin(currentUser);
      return isAdmin;
    }

    
    return this.auth.loadUser().pipe(
      map(user => {
        const isAdmin = user?.role === 'admin' || user?.roles?.some(role => {
          return (typeof role === 'string' && role === 'admin') || 
                 (typeof role === 'object' && 'name' in role && role.name === 'admin');
        });
        
        if (!isAdmin) {
          return this.router.createUrlTree(['/']);
        }
        return true;
      })
    );
  }

  private checkAdmin(user: User | null): boolean | UrlTree {
    if (!user) {
      return this.router.createUrlTree(['/login']);
    }

    const isAdmin = this.checkAdminRole(user);


    if (isAdmin) {
      return true;
    }
    
    return this.router.createUrlTree(['/']);
  }
  
  private checkAdminRole(user: User | null): boolean {
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
}
