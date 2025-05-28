import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ArticleService } from "../../services/article/article.service";
import { CommentService } from "../../services/comment/comment.service";
import { WebSocketService } from "../../services/websocket/websocket.service";
import { AuthService } from "../../services/auth/auth.service";
import { Article, Comment } from "../../models/blog.models";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-article-page",
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatInputModule],
  template: `
    @if (article()) {
    <div class="article-page">
      <h2>{{ article()?.title }}</h2>
      <p>{{ article()?.content }}</p>

      <div class="comments-section">
        <h3>Comments</h3>
        <ul class="comments-list">
          @for (comment of comments(); track comment._id) {
          <li class="comment">
            <div class="comment-header">
              <strong>{{ comment.author.username }}</strong>
              <span class="comment-date">{{ comment.createdAt }}</span>
            </div>
            <p>{{ comment.content }}</p>
          </li>
          }
        </ul>

        <form (ngSubmit)="addComment()" class="comment-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Add a comment</mat-label>
            <textarea
              matInput
              [(ngModel)]="newComment"
              name="comment"
              required
              rows="3"
            ></textarea>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">
            Post Comment
          </button>
        </form>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .article-page {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
      }
      .comments-section {
        margin-top: 2rem;
      }
      .comments-list {
        list-style: none;
        padding: 0;
      }
      .comment {
        border-bottom: 1px solid #eee;
        padding: 1rem 0;
      }
      .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      .comment-date {
        color: #666;
        font-size: 0.9em;
      }
      .comment-form {
        margin-top: 2rem;
      }
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class ArticlePageComponent implements OnInit, OnDestroy {
  article = signal<Article | null>(null);
  comments = signal<Comment[]>([]);
  newComment = "";

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private commentService: CommentService,
    private wsService: WebSocketService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    this.articleService.getArticleById(id).subscribe((article) => {
      this.article.set(article);
    });

    this.commentService.getCommentsByArticle(id).subscribe((comments) => {
      this.comments.set(comments);
    });

    this.wsService.connectToArticle(id);
    this.wsService.comments$.subscribe((comment) => {
      this.comments.set([...this.comments(), comment]);
    });
  }

  ngOnDestroy() {
    this.wsService.disconnect();
  }

  addComment() {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id || !this.newComment.trim()) return;

    this.commentService.addComment(id, this.newComment).subscribe((comment) => {
      this.comments.set([...this.comments(), comment]);
      this.newComment = "";
    });
  }
}
