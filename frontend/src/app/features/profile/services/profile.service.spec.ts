import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets the current user profile', () => {
    service.getCurrentProfile().subscribe();

    const request = httpMock.expectOne('/api/v1/users/me');
    expect(request.request.method).toBe('GET');
    request.flush({ id: 'user-1', username: 'lea', email: 'lea@example.com', subscriptions: [] });
  });

  it('updates only the provided profile fields', () => {
    const payload = { username: 'lea-dev' };
    service.updateCurrentProfile(payload).subscribe();

    const request = httpMock.expectOne('/api/v1/users/me');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 'user-1', username: 'lea-dev', email: 'lea@example.com', subscriptions: [] });
  });
});
