import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ArticleService } from '@features/articles/services/article.service';
import { CommentService } from '@features/comments/services/comment.service';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import { NotificationService } from '@core/notification/notification.service';
import { ArticleDetailComponent } from './article-detail';

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let articleService: { getById: ReturnType<typeof vi.fn> };
  let commentService: { getByArticleId: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    articleService = {
      getById: vi.fn(() => of({
        id: 'article-1',
        title: 'Comprendre les signaux Angular',
        slug: 'comprendre-les-signaux-angular',
        excerpt: 'Une introduction aux signaux.',
        content: 'Le contenu de l’article.',
        author: { id: 'user-1', username: 'orlando' },
        topic: { id: 'topic-1', name: 'Angular', subscribed: true },
        createdAt: '2026-10-01T09:30:00Z',
        updatedAt: '2026-10-01T09:30:00Z',
        commentCount: 0,
      })),
    };
    commentService = {
      getByArticleId: vi.fn(() => of({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })),
      create: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ArticleDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'article-1' }) } } },
        { provide: ArticleService, useValue: articleService },
        { provide: CommentService, useValue: commentService },
        { provide: NotificationService, useValue: { error: vi.fn() } },
        FormApiErrorService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the selected article and its comments', () => {
    expect(articleService.getById).toHaveBeenCalledWith('article-1');
    expect(commentService.getByArticleId).toHaveBeenCalledWith('article-1');
    expect(fixture.nativeElement.textContent).toContain('Comprendre les signaux Angular');
  });
});
