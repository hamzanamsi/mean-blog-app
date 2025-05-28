import { Component, EventEmitter, Output, signal } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { environment } from "../../../../environments/environments";

@Component({
  selector: "app-admin-code",
  standalone: true,
  imports: [MatInputModule, MatButtonModule, FormsModule, NgIf],
  template: `
    <div>
      <mat-form-field appearance="outline">
        <mat-label>Enter Admin Code</mat-label>
        <input matInput [(ngModel)]="code" type="password" />
      </mat-form-field>
      <div style="margin-top: 1rem;">
        <button mat-raised-button color="primary" (click)="validateCode()">
          Validate
        </button>
        <button mat-button (click)="cancel.emit()">Cancel</button>
      </div>
      <div *ngIf="error()" style="color: red; margin-top: 0.5rem;">
        Invalid admin code.
      </div>
    </div>
  `,
})
export class AdminCodeComponent {
  @Output() adminValidated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  code = "";
  error = signal(false);

  validateCode() {

    if (this.code === environment.adminCode) {
      this.error.set(false);
      this.adminValidated.emit();
    } else {
      this.error.set(true);
    }
  }
}
