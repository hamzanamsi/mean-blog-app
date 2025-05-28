import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Subject } from "rxjs";
import { Comment } from "../../models/blog.models";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private commentSubject = new Subject<Comment>();

  comments$ = this.commentSubject.asObservable();

  connectToArticle(articleId: string) {
    this.socket = new WebSocket(
      `${environment.apiUrl}/articles/${articleId}/comments`
    );

    this.socket.onmessage = (event) => {
      const comment = JSON.parse(event.data);
      this.commentSubject.next(comment);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
