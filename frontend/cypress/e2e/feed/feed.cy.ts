import { visitAsAuthenticatedUser } from '../../support/auth';

const article = {
  id: 'article-1',
  title: 'Comprendre les signaux Angular',
  slug: 'comprendre-les-signaux-angular',
  excerpt: 'Une introduction aux signaux Angular.',
  author: { id: 'user-1', username: 'orlando' },
  topic: { id: 'topic-1', name: 'Angular', subscribed: true },
  createdAt: '2026-10-01T09:30:00Z',
};

describe('Fil d’actualité', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', pathname: '/api/v1/articles' }, {
      statusCode: 200,
      body: { content: [article], page: 0, size: 10, totalElements: 1, totalPages: 1 },
    }).as('getFeed');
    cy.intercept('GET', '**/api/v1/articles/article-1', {
      statusCode: 200,
      body: { ...article, content: 'Le contenu complet de l’article.', updatedAt: article.createdAt, commentCount: 0 },
    });
    cy.intercept('GET', '**/api/v1/articles/article-1/comments*', {
      statusCode: 200,
      body: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
    });

    visitAsAuthenticatedUser('/feed');
    cy.wait('@getFeed');
  });

  it('affiche les articles des abonnements et ouvre le détail sélectionné', () => {
    cy.contains('h2', article.title).should('be.visible');
    cy.contains('a', article.title).click();
    cy.location('pathname').should('eq', `/articles/${article.id}`);
  });

  it('demande le fil dans l’ordre croissant lorsque le tri est inversé', () => {
    cy.contains('button', 'Trier par').click();

    cy.wait('@getFeed').its('request.query').should('include', { sort: 'oldest', page: '0', size: '10' });
  });
});
