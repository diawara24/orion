import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchApiError } from '@core/http/catch-api-error.operator';
import { environment } from '@env/environment';
import type { Observable } from 'rxjs';
import type { ArticlePageResponse, PageRequestParams } from '../models/article.model';



@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly apiBaseUrl =
    'apiBaseUrl' in environment && typeof environment.apiBaseUrl === 'string'
      ? environment.apiBaseUrl.replace(/\/$/, '')
      : '/api/v1';

  private readonly http = inject(HttpClient);

  getSubscribedArticles( params: PageRequestParams = {} ): Observable<ArticlePageResponse> {
    const { sort = 'newest', page = 0, size = 10 } = params;

    return this.http
      .get<ArticlePageResponse>(`${this.apiBaseUrl}/articles`, {
        params: {
          sort,
          page,
          size,
        },
      })
      .pipe(catchApiError());
  }
}
