import { httpResource, HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { catchApiError } from '@core/http/catch-api-error.operator';
import { toApiError } from '@core/http/api-error.model';
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

  /** Source de vérité partagée des thèmes, chargée avec HttpResource. */
  readonly topicsResource = httpResource<readonly TopicOption[]>(() => `${this.apiBaseUrl}/topics`);
  readonly topics = computed(() => this.topicsResource.value() ?? []);
  readonly topicsErrorMessage = computed(() => {
    const error = this.topicsResource.error();
    return error ? toApiError(error).detail : null;
  });

  subscribeToTopic(topicId: string): Observable<void> {
    return this.http
      .put<void>(`${this.apiBaseUrl}/topics/${topicId}/subscription`, null)
      .pipe(catchApiError());
  }

  unsubscribeFromTopic(topicId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiBaseUrl}/topics/${topicId}/subscription`)
      .pipe(catchApiError());
  }

  reloadTopics(): void {
    this.topicsResource.reload();
  }
}
