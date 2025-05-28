import { Component, OnInit, signal } from "@angular/core";
import { UserListComponent } from "../user-list/user-list.component";
import { ArticleListComponent } from "../../article-list/article-list.component";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [UserListComponent, ArticleListComponent],
  template: `
    <div class="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <app-user-list></app-user-list>
      <app-article-list></app-article-list>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        padding: 2rem;
      }
    `,
  ],
})
export class AdminDashboardComponent {}
