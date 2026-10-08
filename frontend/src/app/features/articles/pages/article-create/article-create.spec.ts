import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArticleService } from '@features/articles/services/article.service';
import { TopicService } from '@features/topic/services/topic.service';
import { NotificationService } from '@core/notification/notification.service';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import type { ApiError } from '@core/http/api-error.model';
import { ArticleCreate } from './article-create';

describe('ArticleCreate', () => {
  let component: ArticleCreate;
  let fixture: ComponentFixture<ArticleCreate>;
  let articleService: { create: ReturnType<typeof vi.fn> };
  let router: Router;
  let notificationService: { error: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    articleService = { create: vi.fn() };
    notificationService = { error: vi.fn(), success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ArticleCreate],
      providers: [
        provideRouter([]),
        { provide: ArticleService, useValue: articleService },
        { provide: TopicService, useValue: { getTopics: vi.fn(() => of([])) } },
        { provide: NotificationService, useValue: notificationService },
        FormApiErrorService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCreate);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks every field as touched instead of publishing an invalid form', () => {
    component.onSubmit();

    expect(component.f.topicId.touched).toBe(true);
    expect(component.f.title.touched).toBe(true);
    expect(component.f.content.touched).toBe(true);
    expect(articleService.create).not.toHaveBeenCalled();
  });

  it('publishes a valid article then returns to the feed', () => {
    articleService.create.mockReturnValue(of({ id: 'article-1' }));
    component.articleForm.setValue({
      topicId: 'topic-1',
      title: 'Découvrir Angular',
      content: 'Un article pour découvrir Angular.',
    });

    component.onSubmit();

    expect(articleService.create).toHaveBeenCalledWith(component.articleForm.getRawValue());
    expect(notificationService.success).toHaveBeenCalledWith('Article publié avec succès.');
    expect(router.navigate).toHaveBeenCalledWith(['/feed']);
  });

  it('displays the backend message when publishing fails', () => {
    const error: ApiError = {
      type: 'about:blank',
      title: 'Erreur interne',
      status: 500,
      detail: 'La publication est temporairement indisponible.',
      instance: '/api/v1/articles',
    };
    articleService.create.mockReturnValue(throwError(() => error));
    component.articleForm.setValue({
      topicId: 'topic-1',
      title: 'Découvrir Angular',
      content: 'Un article pour découvrir Angular.',
    });

    component.onSubmit();

    expect(notificationService.error).toHaveBeenCalledWith(error.detail);
  });
});
