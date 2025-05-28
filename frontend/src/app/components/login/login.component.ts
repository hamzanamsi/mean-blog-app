import { Component, signal } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-login",
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
      <h2>Sign In</h2>
      <form (ngSubmit)="onLogin()">
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
          color="primary"
          class="full-width"
          [disabled]="auth.loading()"
        >
          <ng-container *ngIf="!auth.loading(); else loadingTpl"
            >Sign In</ng-container
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
    `,
  ],
})
export class LoginComponent {
  email = "";
  password = "";
  error = signal("");

  constructor(public auth: AuthService, private router: Router) {}

  onLogin() {
    this.error.set("");
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.loading.set(false);

        const role = res?.user?.role || res?.user?.roles?.[0];
        
        if (role === "admin") {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.auth.loading.set(false);
        this.error.set(err.error?.message || "Login failed. Please check your credentials and try again.");
      },
    });
  }
}
