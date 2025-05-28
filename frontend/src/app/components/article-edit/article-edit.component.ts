import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ArticleService } from "../../services/article/article.service";
import { Article } from "../../models/blog.models";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";

@Component({
  selector: "app-article-edit",
  standalone: true,
  imports: [
    FormsModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="edit-article">
      <h2>{{ isEditing ? 'Edit' : 'Create' }} Article</h2>
      
      @if (isLoading) {
        <div class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading article data...</p>
        </div>
      } @else {
        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input 
              matInput 
              [(ngModel)]="article.title" 
              name="title" 
              required
              [disabled]="isSubmitting"
              #titleInput="ngModel"
            />
            @if (titleInput.invalid && titleInput.touched) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Content</mat-label>
            <textarea
              matInput
              [(ngModel)]="article.content"
              name="content"
              required
              rows="10"
              [disabled]="isSubmitting"
              #contentInput="ngModel"
            ></textarea>
            @if (contentInput.invalid && contentInput.touched) {
              <mat-error>Content is required</mat-error>
            }
          </mat-form-field>

          <div class="actions">
            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              [disabled]="isSubmitting || !isFormValid()"
            >
              @if (isSubmitting) {
                <span class="button-loading">
                  <mat-spinner diameter="20"></mat-spinner>
                </span>
              }
              {{ isEditing ? 'Update' : 'Create' }} Article
            </button>
            
            <button 
              mat-stroked-button 
              type="button" 
              (click)="onCancel()"
              [disabled]="isSubmitting"
              class="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .edit-article {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
      }
      .full-width {
        width: 100%;
        margin-bottom: 1.5rem;
      }
      .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }
      .actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }
      .button-loading {
        display: inline-flex;
        align-items: center;
        margin-right: 8px;
      }
      mat-spinner {
        margin: 0 auto;
      }
      .cancel-btn {
        margin-left: 8px;
      }
    `,
  ],
})
export class ArticleEditComponent implements OnInit, OnDestroy {
  article: Partial<Article> = { title: "", content: "" };
  isEditing = false;
  isLoading = true;
  isSubmitting = false;
  private subscriptions = new Subscription();

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditing = true;
      this.loadArticle(id);
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private loadArticle(id: string) {
    this.isLoading = true;
    this.subscriptions.add(
      this.articleService.getArticleById(id).subscribe({
        next: (article) => {
          this.article = article;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading article:', error);
          this.snackBar.open('Failed to load article', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.router.navigate(['/articles']);
        }
      })
    );
  }

  isFormValid(): boolean {
    return !!this.article.title?.trim() && !!this.article.content?.trim();
  }

  onCancel() {
    this.router.navigate(['/articles']);
  }

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;

    const subscription = this.isEditing 
      ? this.articleService.updateArticle(
          this.article._id!,
          { 
            title: this.article.title,
            content: this.article.content,
          }
        )
      : this.articleService.createArticle(this.article);

    this.subscriptions.add(
      subscription.subscribe({
        next: () => {
          this.snackBar.open(
            `Article ${this.isEditing ? 'updated' : 'created'} successfully!`,
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          console.error('Error saving article:', error);
          this.snackBar.open(
            `Failed to ${this.isEditing ? 'update' : 'create'} article: ${error.message || 'Unknown error'}`,
            'Close',
            { 
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
          this.isSubmitting = false;
        }
      })
    );
  }
}