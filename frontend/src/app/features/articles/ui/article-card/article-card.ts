import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Article } from '@features/articles/models/article.model';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-article-card',
  styleUrl: './article-card.scss',
  templateUrl: './article-card.html',
})
export class ArticleCard {
  readonly article = input.required<Article>();
}
