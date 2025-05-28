import { Routes } from "@angular/router";
import { ArticleEditComponent } from "./components/article-edit/article-edit.component";

import { WelcomeComponent } from "./components/welcome/welcome.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { AdminDashboardComponent } from "./components/admin/admin-dashboard/admin-dashboard.component";
import { UserDashboardComponent } from "./components/user-dashboard/user-dashboard.component";
import { ArticlePageComponent } from "./components/article-page/article-page.component";
import { AdminGuard } from "./guards/admin.guard";

export const routes: Routes = [
  { path: "", component: WelcomeComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "admin",
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
  },
  { 
    path: "dashboard", 
    component: UserDashboardComponent,
  },
  { 
    path: "article/:id", 
    component: ArticlePageComponent 
  },
  {
    path: "articles/new",
    component: ArticleEditComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "articles/edit/:id",
    component: ArticleEditComponent,
    canActivate: [AdminGuard],
  },
  { path: '**', redirectTo: '' }
];
