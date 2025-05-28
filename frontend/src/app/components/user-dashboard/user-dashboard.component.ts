import { Component, OnInit, signal } from "@angular/core";
import { ArticleService } from "../../services/article/article.service";
import { AuthService } from "../../services/auth/auth.service";
import { Article } from "../../models/blog.models";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-user-dashboard",
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="user-dashboard">
      <h2>Articles</h2>
      <ul>
        @for (article of articles(); track article._id) {
        <li>
          <a [routerLink]="['/article', article._id]">{{ article.title }}</a>
          @if (article.authorId === auth.currentUser()?._id) {
          <span>
            <button (click)="editArticle(article)">Edit</button>
            <button (click)="deleteArticle(article._id)">Delete</button>
          </span>
          }
        </li>
        }
      </ul>
    </div>
  `,
})
export class UserDashboardComponent implements OnInit {
  articles = signal<Article[]>([]);
  constructor(
    private articleService: ArticleService,
    public auth: AuthService
  ) {}
  ngOnInit() {
    this.articleService
      .getAllArticles()
      .subscribe((articles) => this.articles.set(articles));
  }
  editArticle(article: Article) {
    /* ... */
  }
  deleteArticle(id: string) {
    this.articleService.deleteArticle(id).subscribe(() => {
      this.articles.set(this.articles().filter((a) => a._id !== id));
    });
  }
}
