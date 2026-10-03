import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ArticleService } from "./article.service";
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { PageRequestParams } from "../models/article.model";

describe('ArticleService', () => {
  // Déclaration des variables pour le service et le mock HTTP
  let service: ArticleService;

  // Déclaration du mock HTTP
  let httpMock: HttpTestingController;

  // Configuration du module de test avant chaque test
  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    // Injection du mock HTTP
    httpMock = TestBed.inject(HttpTestingController);
  });

   afterEach(() => {
    httpMock.verify();
  });

  it('Should return subscribed articles by logged-in user', () => {
      service = TestBed.inject(ArticleService);

      const data: PageRequestParams = { sort: 'newest', page: 0, size: 10 };

      service.getSubscribedArticles(data).subscribe((response) => {
        expect(response.content).toEqual([]);
        expect(response.page).toBe(0);
      });

      const request = httpMock.expectOne(
        (request) => request.method === 'GET' && request.url === '/api/v1/articles',
      );
      expect(request.request.params.get('sort')).toBe('newest');
      expect(request.request.params.get('page')).toBe('0');
      expect(request.request.params.get('size')).toBe('10');

      request.flush({
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      });
    });

});
