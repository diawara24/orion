import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets comments for an article', () => {
    service.getByArticleId('article-1').subscribe();

    const request = httpMock.expectOne(
      (httpRequest) => httpRequest.url === '/api/v1/articles/article-1/comments',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('20');
    request.flush({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('creates a comment for an article', () => {
    service.create('article-1', { content: 'Très bon article !' }).subscribe();

    const request = httpMock.expectOne('/api/v1/articles/article-1/comments');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ content: 'Très bon article !' });
    request.flush({ id: 'comment-1' });
  });
});
