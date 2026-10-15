import { visitAsAuthenticatedUser } from '../../support/auth';

const article = {
  id: 'article-1',
  title: 'Comprendre les signaux Angular',
  slug: 'comprendre-les-signaux-angular',
  excerpt: 'Une introduction aux signaux Angular.',
  content: 'Les signaux permettent de représenter simplement un état réactif.',
  author: { id: 'user-1', username: 'orlando' },
  topic: { id: 'topic-1', name: 'Angular', subscribed: true },
  createdAt: '2026-10-01T09:30:00Z',
  updatedAt: '2026-10-01T09:30:00Z',
  commentCount: 1,
};

describe('Détail d’un article', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/articles/article-1', { statusCode: 200, body: article }).as('getArticle');
    cy.intercept('GET', '**/api/v1/articles/article-1/comments*', {
      statusCode: 200,
      body: {
        content: [{
          id: 'comment-1',
          content: 'Très bon article.',
          author: { id: 'user-2', username: 'lea' },
          createdAt: '2026-10-01T10:00:00Z',
          updatedAt: '2026-10-01T10:00:00Z',
        }],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    }).as('getComments');

    visitAsAuthenticatedUser('/articles/article-1');
    cy.wait('@getArticle');
    cy.wait('@getComments');
  });

  it('affiche les informations et les commentaires de l’article', () => {
    cy.contains('h1', article.title).should('be.visible');
    cy.contains(article.content).should('be.visible');
    cy.contains('strong', 'lea').should('be.visible');
    cy.contains('Très bon article.').should('be.visible');
  });

  it('publie un commentaire et l’ajoute à la liste', () => {
    cy.intercept('POST', '**/api/v1/articles/article-1/comments', {
      statusCode: 201,
      body: {
        id: 'comment-2',
        content: 'Merci pour ces explications.',
        author: { id: 'user-1', username: 'orlando' },
        createdAt: '2026-10-01T11:00:00Z',
        updatedAt: '2026-10-01T11:00:00Z',
      },
    }).as('createComment');

    cy.get('#comment-content').type('Merci pour ces explications.');
    cy.get('button[aria-label="Publier le commentaire"]').click();

    cy.wait('@createComment').its('request.body').should('deep.equal', {
      content: 'Merci pour ces explications.',
    });
    cy.contains('Merci pour ces explications.').should('be.visible');
    cy.contains('Commentaires (2)').should('be.visible');
  });
});
