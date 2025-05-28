import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environments";
import { catchError, Observable, tap, throwError } from "rxjs";
import { Article } from "../../models/blog.models";

@Injectable({
  providedIn: "root",
})
export class ArticleService {
  constructor(private http: HttpClient) {}

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${environment.apiUrl}/articles`);
  }

  getAllArticlesWithAuthors(): Observable<Article[]> {
    return this.http.get<Article[]>(
      `${environment.apiUrl}/articles?populate=author`
    );
  }

  getArticleById(id: string): Observable<Article> {
    return this.http.get<Article>(`${environment.apiUrl}/articles/${id}`);
  }

  createArticle(data: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(
      `${environment.apiUrl}/articles`, 
      data,
      {
        withCredentials: true,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    );
  }

  updateArticle(id: string, article: Partial<Article>): Observable<Article> {
    return this.http.patch<Article>(
      `${environment.apiUrl}/articles/${id}`, 
      article,
      {
        withCredentials: true,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    );
  }
  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/articles/${id}`);
  }
}
