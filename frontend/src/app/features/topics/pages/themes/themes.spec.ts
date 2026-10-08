import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificationService } from '@core/notification/notification.service';
import { TopicService } from '@features/topics/services/topic.service';
import { Themes } from './themes';

describe('Themes', () => {
  let component: Themes;
  let fixture: ComponentFixture<Themes>;
  let httpMock: HttpTestingController;
  let topicService: TopicService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Themes],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: { error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Themes);
    component = fixture.componentInstance;
    topicService = TestBed.inject(TopicService);
    vi.spyOn(topicService, 'subscribeToTopic').mockReturnValue(of(undefined));
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne('/api/v1/topics').flush([
      { id: 'topic-1', name: 'Angular', subscribed: false },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the topics loaded by HttpResource', () => {
    expect(fixture.nativeElement.textContent).toContain('Angular');
    expect(fixture.nativeElement.textContent).toContain('S’abonner');
  });

  it('subscribes to a topic then reloads the resource', async () => {
    const reloadTopics = vi.spyOn(topicService, 'reloadTopics').mockImplementation(() => undefined);

    component.toggleSubscription({ id: 'topic-1', name: 'Angular', subscribed: false });

    expect(topicService.subscribeToTopic).toHaveBeenCalledWith('topic-1');
    expect(reloadTopics).toHaveBeenCalledOnce();
  });
});
