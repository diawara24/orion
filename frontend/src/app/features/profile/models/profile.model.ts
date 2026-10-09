import type { User } from '@core/model/auth.model';

export interface ProfileTopic {
  id: string;
  name: string;
  subscribed: boolean;
}

export interface UserProfile extends User {
  subscriptions: ProfileTopic[];
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  currentPassword?: string;
  password?: string;
}
