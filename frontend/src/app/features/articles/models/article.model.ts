import type { User } from '@core/model/auth.model';
import type { Topic } from '@features/topics/models/topic.model';

/** Représentation légère renvoyée dans le fil d’actualité. */
export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: Pick<User, 'id' | 'username'>;
  topic: Pick<Topic, 'id' | 'name' | 'subscribed'>;
  createdAt: string | Date;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  topicId: string;
}

/** Représentation complète renvoyée par la consultation d’un article. */
export interface ArticleDetail extends ArticleSummary {
  content: string;
  updatedAt: string | Date;
  commentCount: number;
}

export interface ArticlePageResponse {
  content: ArticleSummary[];
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
