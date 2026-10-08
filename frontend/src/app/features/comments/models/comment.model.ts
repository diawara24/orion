import type { User } from '@core/model/auth.model';

export interface Comment {
  id: string;
  content: string;
  author: Pick<User, 'id' | 'username'>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CommentPageResponse {
  content: Comment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateCommentRequest {
  content: string;
}
