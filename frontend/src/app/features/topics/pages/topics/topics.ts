import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { ApiError } from '@core/http/api-error.model';
import { NotificationService } from '@core/notification/notification.service';
import { TopicService, type TopicOption } from '@features/topics/services/topic.service';

@Component({
  imports: [],
  selector: 'app-topics',
  styleUrl: './topics.scss',
  templateUrl: './topics.html',
})
export class Topics {
  private readonly topicService = inject(TopicService);
  private readonly notificationService = inject(NotificationService);

  readonly topicsResource = this.topicService.topicsResource;
  readonly topics = this.topicService.topics;
  readonly errorMessage = this.topicService.topicsErrorMessage;
  readonly pendingTopicId = signal<string | null>(null);

  toggleSubscription(topic: TopicOption): void {
    if (this.pendingTopicId()) {
      return;
    }

    this.pendingTopicId.set(topic.id);
    const request = this.topicService.subscribeToTopic(topic.id);

    request.pipe(finalize(() => this.pendingTopicId.set(null))).subscribe({
      next: () => this.topicService.reloadTopics(),
      error: (error: ApiError) => this.notificationService.error(error.detail),
    });
  }
}
