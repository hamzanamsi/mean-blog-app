import { Component, signal } from "@angular/core";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { NgIf } from "@angular/common";
import { AdminCodeComponent } from "../admin/admin-code/admin-code.component";

@Component({
  selector: "app-welcome",
  standalone: true,
  imports: [MatButtonModule, MatCardModule, NgIf, AdminCodeComponent],
  template: `
    <mat-card class="welcome-card">
      <h1>Welcome to the Collaborative Blog!</h1>
      <p>Share, comment, and collaborate with multiple authors.</p>
      <div class="button-group">
        <button mat-raised-button color="primary" (click)="goTo('login')">
          Sign In
        </button>
        <button mat-raised-button color="accent" (click)="goTo('register')">
          Sign Up
        </button>
        <button
          mat-stroked-button
          color="warn"
          (click)="showAdminCodeInput.set(true)"
        >
          Register as Admin
        </button>
      </div>
      <app-admin-code
        *ngIf="showAdminCodeInput()"
        (adminValidated)="onAdminValidated()"
        (cancel)="showAdminCodeInput.set(false)"
      >
      </app-admin-code>
    </mat-card>
  `,
  styles: [
    `
      .welcome-card {
        max-width: 400px;
        margin: 60px auto;
        text-align: center;
        padding: 2rem;
      }
      .button-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
      }
    `,
  ],
})
export class WelcomeComponent {
  showAdminCodeInput = signal(false);

  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  onAdminValidated() {
    this.router.navigate(["/register"], { queryParams: { admin: true } });
  }
}
