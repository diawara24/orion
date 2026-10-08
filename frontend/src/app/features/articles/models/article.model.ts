import type { User } from '@core/model/auth.model';
import type { Topic } from '@features/topics/models/topic.model';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: Pick<User, 'id' | 'username'>;
  topic: Pick<Topic, 'id' | 'name' | 'subscribed'>;
  createdAt: string | Date;
  commentCount: number;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  topicId: string;
}

export interface ArticleDetail extends Article {
  content: string;
  updatedAt: string | Date;
}

export interface ArticlePageResponse {
  content: Article[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type ArticleSort = 'newest' | 'oldest';

export interface PageRequestParams {
  sort?: ArticleSort;
  page?: number;
  size?: number;
}
