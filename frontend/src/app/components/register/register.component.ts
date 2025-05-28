import { Component, signal } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { environment } from "../../../environments/environments";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule,
    NgIf,
  ],
  template: `
    <mat-card class="auth-card">
      <h2>Sign Up <span *ngIf="isAdmin()" class="admin-badge">Admin</span></h2>
      <form (ngSubmit)="onRegister()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="username" name="username" required />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input
            matInput
            [(ngModel)]="email"
            name="email"
            required
            type="email"
          />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input
            matInput
            [(ngModel)]="password"
            name="password"
            required
            type="password"
          />
        </mat-form-field>
        <button
          mat-raised-button
          color="accent"
          class="full-width"
          [disabled]="auth.loading()"
        >
          <ng-container *ngIf="!auth.loading(); else loadingTpl"
            >Sign Up</ng-container
          >
        </button>
        <ng-template #loadingTpl>
          <mat-progress-spinner
            diameter="20"
            mode="indeterminate"
          ></mat-progress-spinner>
        </ng-template>
        <div *ngIf="error()" class="error-msg">{{ error() }}</div>
      </form>
    </mat-card>
  `,
  styles: [
    `
      .auth-card {
        max-width: 400px;
        margin: 60px auto;
        padding: 2rem;
      }
      .full-width {
        width: 100%;
      }
      .error-msg {
        color: red;
        margin-top: 1rem;
      }
      .admin-badge {
        background: #ff4081;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        margin-left: 8px;
      }
    `,
  ],
})
export class RegisterComponent {
  username = "";
  email = "";
  password = "";
  error = signal("");
  admin = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.admin = params["admin"] === "true";
    });
  }

  isAdmin() {
    return this.admin;
  }

  onRegister() {
    this.error.set("");
    this.auth
      .register({
        username: this.username,
        email: this.email,
        password: this.password,
        adminCode: this.admin ? environment.adminCode : undefined,
      })
      .subscribe({
        next: () => {
          this.auth.loading.set(false);
          this.router.navigate(["/login"]);
        },
        error: (err) => {
          this.auth.loading.set(false);
          this.error.set(err.error?.message || "Registration failed");
        },
      });
  }
}
