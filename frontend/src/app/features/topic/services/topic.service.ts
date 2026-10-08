import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchApiError } from '@core/http/catch-api-error.operator';
import { environment } from '@env/environment';
import type { Observable } from 'rxjs';
import type { Topic } from '../models/topic.model';

export type TopicOption = Pick<Topic, 'id' | 'name' | 'subscribed'>;

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private readonly apiBaseUrl =
    'apiBaseUrl' in environment && typeof environment.apiBaseUrl === 'string'
      ? environment.apiBaseUrl.replace(/\/$/, '')
      : '/api/v1';

  private readonly http = inject(HttpClient);

  getTopics(): Observable<readonly TopicOption[]> {
    return this.http
      .get<readonly TopicOption[]>(`${this.apiBaseUrl}/topics`)
      .pipe(catchApiError());
  }
}
