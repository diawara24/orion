import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import type { ApiError } from '@core/http/api-error.model';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import { NotificationService } from '@core/notification/notification.service';
import { TopicService } from '@features/topics/services/topic.service';
import type { UpdateProfileRequest, UserProfile } from '../../models/profile.model';
import { ProfileService } from '../../services/profile.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly topicService = inject(TopicService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly formApiErrorService = inject(FormApiErrorService);
  private readonly fb = inject(FormBuilder);

  readonly profile = signal<UserProfile | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly pendingTopicId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    currentPassword: [''],
    password: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  save(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const profile = this.profile();
    if (!profile) {
      return;
    }

    const request = this.buildUpdateRequest(profile);
    if (Object.keys(request).length === 0) {
      this.notificationService.success('Aucune modification à enregistrer.');
      return;
    }

    if (request.password && !request.currentPassword) {
      this.profileForm.controls.currentPassword.setErrors({ required: true });
      this.profileForm.controls.currentPassword.markAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.profileService
      .updateCurrentProfile(request)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedProfile) => {
          this.profile.set(updatedProfile);
          this.authService.updateCurrentUser(updatedProfile);
          this.profileForm.patchValue({
            username: updatedProfile.username,
            email: updatedProfile.email,
            currentPassword: '',
            password: '',
          });
          this.profileForm.markAsPristine();
          this.notificationService.success('Profil mis à jour.');
        },
        error: (error: ApiError) => {
          if (!this.formApiErrorService.apply(error, this.profileForm)) {
            this.notificationService.error(error.detail);
          }
        },
      });
  }

  unsubscribe(topicId: string): void {
    if (this.pendingTopicId()) {
      return;
    }

    this.pendingTopicId.set(topicId);
    this.topicService
      .unsubscribeFromTopic(topicId)
      .pipe(finalize(() => this.pendingTopicId.set(null)))
      .subscribe({
        next: () => {
          this.profile.update((profile) =>
            profile
              ? { ...profile, subscriptions: profile.subscriptions.filter((topic) => topic.id !== topicId) }
              : profile,
          );
          this.topicService.reloadTopics();
          this.notificationService.success('Vous êtes désabonné de ce thème.');
        },
        error: (error: ApiError) => this.notificationService.error(error.detail),
      });
  }

  get f() {
    return this.profileForm.controls;
  }

  private loadProfile(): void {
    this.profileService
      .getCurrentProfile()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.profileForm.patchValue({ username: profile.username, email: profile.email });
          this.profileForm.markAsPristine();
        },
        error: (error: ApiError) => {
          this.errorMessage.set(error.detail);
          this.notificationService.error(error.detail);
        },
      });
  }

  private buildUpdateRequest(profile: UserProfile): UpdateProfileRequest {
    const { username, email, currentPassword, password } = this.profileForm.getRawValue();
    const request: UpdateProfileRequest = {};

    if (username !== profile.username) {
      request.username = username;
    }
    if (email !== profile.email) {
      request.email = email;
    }
    if (password) {
      request.password = password;
      request.currentPassword = currentPassword;
    }

    return request;
  }
}
