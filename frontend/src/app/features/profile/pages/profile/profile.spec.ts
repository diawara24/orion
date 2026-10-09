import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import { NotificationService } from '@core/notification/notification.service';
import { TopicService } from '@features/topics/services/topic.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let profileService: { getCurrentProfile: ReturnType<typeof vi.fn>; updateCurrentProfile: ReturnType<typeof vi.fn> };
  let authService: { updateCurrentUser: ReturnType<typeof vi.fn> };
  let topicService: { unsubscribeFromTopic: ReturnType<typeof vi.fn>; reloadTopics: ReturnType<typeof vi.fn> };

  const profile = {
    id: 'user-1',
    username: 'lea',
    email: 'lea@example.com',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    subscriptions: [{ id: 'topic-1', name: 'Angular', subscribed: true }],
  };

  beforeEach(async () => {
    profileService = {
      getCurrentProfile: vi.fn(() => of(profile)),
      updateCurrentProfile: vi.fn(),
    };
    authService = { updateCurrentUser: vi.fn() };
    topicService = { unsubscribeFromTopic: vi.fn(), reloadTopics: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        { provide: ProfileService, useValue: profileService },
        { provide: AuthService, useValue: authService },
        { provide: TopicService, useValue: topicService },
        { provide: NotificationService, useValue: { error: vi.fn(), success: vi.fn() } },
        FormApiErrorService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the profile and subscriptions', () => {
    expect(profileService.getCurrentProfile).toHaveBeenCalledOnce();
    expect((fixture.nativeElement.querySelector('#email') as HTMLInputElement).value).toBe('lea@example.com');
    expect(fixture.nativeElement.textContent).toContain('Angular');
  });

  it('sends only changed fields when the profile is saved', () => {
    profileService.updateCurrentProfile.mockReturnValue(of({ ...profile, username: 'lea-dev' }));
    component.profileForm.controls.username.setValue('lea-dev');

    component.save();

    expect(profileService.updateCurrentProfile).toHaveBeenCalledWith({ username: 'lea-dev' });
    expect(authService.updateCurrentUser).toHaveBeenCalledWith(expect.objectContaining({ username: 'lea-dev' }));
  });

  it('requires the current password when a new password is entered', () => {
    component.profileForm.controls.password.setValue('Orion2026!');

    component.save();

    expect(component.f.currentPassword.hasError('required')).toBe(true);
    expect(profileService.updateCurrentProfile).not.toHaveBeenCalled();
  });
});
