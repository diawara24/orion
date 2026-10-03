import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ArticleCard } from './article-card';

describe('ArticleCard', () => {
  let component: ArticleCard;
  let fixture: ComponentFixture<ArticleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('article', {
      id: 'introduction-api-rest',
      title: 'Comprendre les bases d’une API REST',
      slug: 'comprendre-les-bases-d-une-api-rest',
      excerpt: 'Une introduction aux principes fondamentaux d’une API REST.',
      author: { id: 'user-1', username: 'Maya Martin' },
      topic: { id: 'topic-api', name: 'API REST', subscribed: true },
      createdAt: '2026-10-01T09:30:00Z',
      commentCount: 12,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the article information', () => {
    expect(fixture.nativeElement.textContent).toContain('Comprendre les bases d’une API REST');
    expect(fixture.nativeElement.textContent).toContain('Maya Martin');
  });

  it('links to the article detail using its identifier', () => {
    const link = fixture.nativeElement.querySelector('.article-card__link') as HTMLAnchorElement | null;

    expect(link?.getAttribute('href')).toBe('/articles/introduction-api-rest');
  });
});
