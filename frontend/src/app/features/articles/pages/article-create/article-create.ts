import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { BackLink } from '@shared/ui/back-link/back-link';
import { ArticleService } from '@features/articles/services/article.service';
import type { ApiError } from '@core/http/api-error.model';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import { NotificationService } from '@core/notification/notification.service';
import { TopicService } from '@features/topics/services/topic.service';

@Component({
  imports: [BackLink, ReactiveFormsModule],
  selector: 'app-article-create',
  styleUrl: './article-create.scss',
  templateUrl: './article-create.html',
})
export class ArticleCreate {
  private readonly articleService = inject(ArticleService);
  private readonly topicService = inject(TopicService);
  private readonly formApiErrorService = inject(FormApiErrorService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly topicsResource = this.topicService.topicsResource;
  readonly topics = this.topicService.topics;
  readonly topicsErrorMessage = this.topicService.topicsErrorMessage;

  readonly articleForm = this.fb.nonNullable.group({
    topicId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  constructor() {
    Object.values(this.articleForm.controls).forEach((control) => {
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.formApiErrorService.clearServerError(control);
      });
    });
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.articleService
      .create(this.articleForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.success('Article publié avec succès.');
          void this.router.navigate(['/feed']);
        },
        error: (error: ApiError) => {
          if (!this.formApiErrorService.apply(error, this.articleForm)) {
            this.notificationService.error(error.detail);
          }
        },
      });
  }

  reloadTopics(): void {
    this.topicService.reloadTopics();
  }

  get f() {
    return this.articleForm.controls;
  }
}
