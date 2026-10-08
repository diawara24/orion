import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import type { ApiError } from '@core/http/api-error.model';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import { NotificationService } from '@core/notification/notification.service';
import type { ArticleDetail } from '@features/articles/models/article.model';
import { ArticleService } from '@features/articles/services/article.service';
import type { Comment } from '@features/comments/models/comment.model';
import { CommentService } from '@features/comments/services/comment.service';
import { BackLink } from '@shared/ui/back-link/back-link';

@Component({
  imports: [BackLink, DatePipe, ReactiveFormsModule],
  selector: 'app-article-detail',
  styleUrl: './article-detail.scss',
  templateUrl: './article-detail.html',
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);
  private readonly commentService = inject(CommentService);
  private readonly notificationService = inject(NotificationService);
  private readonly formApiErrorService = inject(FormApiErrorService);
  private readonly fb = inject(FormBuilder);

  readonly article = signal<ArticleDetail | null>(null);
  readonly comments = signal<readonly Comment[]>([]);
  readonly isLoading = signal(true);
  readonly isLoadingComments = signal(true);
  readonly isPublishingComment = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');

    if (!articleId) {
      this.errorMessage.set('Cet article est introuvable.');
      this.isLoading.set(false);
      this.isLoadingComments.set(false);
      return;
    }

    this.loadArticle(articleId);
    this.loadComments(articleId);
  }

  publishComment(): void {
    const article = this.article();
    if (!article) {
      return;
    }

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.isPublishingComment.set(true);
    this.commentService
      .create(article.id, this.commentForm.getRawValue())
      .pipe(finalize(() => this.isPublishingComment.set(false)))
      .subscribe({
        next: (comment) => {
          this.comments.update((comments) => [comment, ...comments]);
          this.article.update((currentArticle) =>
            currentArticle
              ? { ...currentArticle, commentCount: currentArticle.commentCount + 1 }
              : currentArticle,
          );
          this.commentForm.reset();
        },
        error: (error: ApiError) => {
          if (!this.formApiErrorService.apply(error, this.commentForm)) {
            this.notificationService.error(error.detail);
          }
        },
      });
  }

  commentInitial(username: string): string {
    return username.trim().charAt(0).toUpperCase();
  }

  private loadArticle(articleId: string): void {
    this.articleService
      .getById(articleId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (article) => this.article.set(article),
        error: (error: ApiError) => {
          this.errorMessage.set(error.detail);
          this.notificationService.error(error.detail);
        },
      });
  }

  private loadComments(articleId: string): void {
    this.commentService
      .getByArticleId(articleId)
      .pipe(finalize(() => this.isLoadingComments.set(false)))
      .subscribe({
        next: (response) => this.comments.set(response.content),
        error: (error: ApiError) => this.notificationService.error(error.detail),
      });
  }
}
