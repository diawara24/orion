import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchApiError } from '@core/http/catch-api-error.operator';
import { environment } from '@env/environment';
import type { Observable } from 'rxjs';
import type { Comment, CommentPageResponse, CreateCommentRequest } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly apiBaseUrl =
    'apiBaseUrl' in environment && typeof environment.apiBaseUrl === 'string'
      ? environment.apiBaseUrl.replace(/\/$/, '')
      : '/api/v1';

  private readonly http = inject(HttpClient);

  getByArticleId(articleId: string, page = 0, size = 20): Observable<CommentPageResponse> {
    return this.http
      .get<CommentPageResponse>(`${this.apiBaseUrl}/articles/${articleId}/comments`, {
        params: { page, size },
      })
      .pipe(catchApiError());
  }

  create(articleId: string, request: CreateCommentRequest): Observable<Comment> {
    return this.http
      .post<Comment>(`${this.apiBaseUrl}/articles/${articleId}/comments`, request)
      .pipe(catchApiError());
  }
}
