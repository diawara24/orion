import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TopicService } from './topic.service';

describe('TopicService', () => {
  let service: TopicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TopicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets topics available to the current user', () => {
    service.getTopics().subscribe((topics) => {
      expect(topics).toHaveLength(1);
      expect(topics[0].name).toBe('Angular');
    });

    const request = httpMock.expectOne('/api/v1/topics');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 'topic-1', name: 'Angular', subscribed: true }]);
  });
});
