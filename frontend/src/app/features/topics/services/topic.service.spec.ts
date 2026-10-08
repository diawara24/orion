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

  it('subscribes to a topic', () => {
    service.subscribeToTopic('topic-1').subscribe();

    const request = httpMock.expectOne('/api/v1/topics/topic-1/subscription');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBeNull();
    request.flush(null);
  });

  it('unsubscribes from a topic', () => {
    service.unsubscribeFromTopic('topic-1').subscribe();

    const request = httpMock.expectOne('/api/v1/topics/topic-1/subscription');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
