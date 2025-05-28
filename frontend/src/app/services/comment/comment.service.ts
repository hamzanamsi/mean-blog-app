import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { Comment } from "../../models/blog.models";

@Injectable({
  providedIn: "root",
})
export class CommentService {
  constructor(private http: HttpClient) {}

  getCommentsByArticle(articleId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${environment.apiUrl}/comments/${articleId}`
    );
  }

  addComment(articleId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${environment.apiUrl}/articles/${articleId}/comments`,
      { content }
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/comments/${commentId}`
    );
  }
}
