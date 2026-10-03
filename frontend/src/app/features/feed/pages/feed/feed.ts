import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import type { ApiError } from '@core/http/api-error.model';
import { NotificationService } from '@core/notification/notification.service';
import { ArticleCard } from '@features/articles/ui/article-card/article-card';
import type { Article, ArticleSort } from '@features/articles/models/article.model';
import { ArticleService } from '@features/articles/services/article.service';
import { RouterModule } from '@angular/router';
import { finalize, type Subscription } from 'rxjs';

@Component({
  imports: [ArticleCard, RouterModule],
  selector: 'app-feed',
  styleUrl: './feed.scss',
  templateUrl: './feed.html',
})
export class Feed implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('loadMoreTrigger') private loadMoreTrigger?: ElementRef<HTMLElement>;

  readonly page = signal(0);
  readonly size = 10;
  readonly totalPages = signal(0);
  readonly isLoadingMore = signal(false);
  readonly articles = signal<readonly Article[]>([]);

  readonly hasMore = computed(() => this.page() + 1 < this.totalPages());

  private readonly articleService = inject(ArticleService);
  private readonly notificationService = inject(NotificationService);

  readonly sort = signal<ArticleSort>('newest');
  readonly sortIcon = computed(() =>
    this.sort() === 'oldest' ? 'arrow_upward' : 'arrow_downward',
  );

  private observer?: IntersectionObserver;
  private activeRequest?: Subscription;

  ngOnInit(): void {
    this.loadFirstPage();
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined' || !this.loadMoreTrigger) {
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.loadNextPage();
        }
      },
      { rootMargin: '200px 0px' },
    );
    this.observer.observe(this.loadMoreTrigger.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.activeRequest?.unsubscribe();
  }

  toggleSort(): void {
    this.sort.update((sort) => (sort === 'newest' ? 'oldest' : 'newest'));
    this.loadFirstPage();
  }

  loadNextPage(): void {
    if (!this.hasMore()) {
      return;
    }

    this.loadPage(this.page() + 1);
  }

  private loadFirstPage(): void {
    this.activeRequest?.unsubscribe();
    this.page.set(0);
    this.totalPages.set(0);
    this.articles.set([]);
    this.isLoadingMore.set(false);
    this.loadPage(0, true);
  }

  private loadPage(page: number, replace = false): void {
    if (this.isLoadingMore() || (!replace && !this.hasMore())) {
      return;
    }

    const sort = this.sort();
    this.isLoadingMore.set(true);

    this.activeRequest = this.articleService
      .getSubscribedArticles({ sort, page, size: this.size })
      .pipe(finalize(() => this.isLoadingMore.set(false)))
      .subscribe({
        next: (response) => {
          if (sort !== this.sort()) {
            return;
          }

          this.page.set(response.page);
          this.totalPages.set(response.totalPages);
          this.articles.update((currentArticles) =>
            replace ? response.content : this.appendUnique(currentArticles, response.content),
          );
          this.scheduleNextPageCheck();
        },
        error: (error: ApiError) => this.notificationService.error(error.detail),
      });
  }

  private appendUnique(currentArticles: readonly Article[], nextArticles: readonly Article[]): Article[] {
    const knownIds = new Set(currentArticles.map((article) => article.id));

    return [...currentArticles, ...nextArticles.filter((article) => !knownIds.has(article.id))];
  }

  private scheduleNextPageCheck(): void {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      return;
    }

    requestAnimationFrame(() => {
      const trigger = this.loadMoreTrigger?.nativeElement;

      if (!trigger || !this.hasMore() || this.isLoadingMore()) {
        return;
      }

      const triggerTop = trigger.getBoundingClientRect().top;
      const preloadBoundary = window.innerHeight + 200;

      if (triggerTop <= preloadBoundary) {
        this.loadNextPage();
      }
    });
  }
}
