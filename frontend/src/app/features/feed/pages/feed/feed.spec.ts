import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '@core/notification/notification.service';
import { ArticleService } from '@features/articles/services/article.service';
import { Feed } from './feed';

describe('Feed', () => {
  let component: Feed;
  let fixture: ComponentFixture<Feed>;
  let articleService: { getSubscribedArticles: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    articleService = {
      getSubscribedArticles: vi.fn(({ page = 0 }) =>
        of({ content: [], page, size: 10, totalElements: 20, totalPages: 2 }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: [
        provideRouter([]),
        {
          provide: ArticleService,
          useValue: articleService,
        },
        {
          provide: NotificationService,
          useValue: { error: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Feed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(articleService.getSubscribedArticles).toHaveBeenCalledWith({
      sort: 'newest',
      page: 0,
      size: 10,
    });
  });

  it('switches to ascending order when the user toggles the sort', async () => {
    component.toggleSort();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.sort()).toBe('oldest');
    expect(component.sortIcon()).toBe('arrow_upward');
    expect(articleService.getSubscribedArticles).toHaveBeenCalledWith({
      sort: 'oldest',
      page: 0,
      size: 10,
    });
  });

  it('loads the next page while articles remain available', () => {
    component.loadNextPage();

    expect(articleService.getSubscribedArticles).toHaveBeenLastCalledWith({
      sort: 'newest',
      page: 1,
      size: 10,
    });
  });
});
