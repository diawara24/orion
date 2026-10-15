import { testUser, visitAsAuthenticatedUser } from '../../support/auth';

describe('Création d’un article', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/topics', {
      statusCode: 200,
      body: [
        {
          id: 'topic-angular',
          name: 'Angular',
          description: 'Le framework Angular.',
          subscribed: true,
        },
        {
          id: 'topic-spring',
          name: 'Spring Boot',
          description: 'Le framework Spring Boot.',
          subscribed: false,
        },
      ],
    }).as('getTopics');

    cy.intercept('GET', '**/api/v1/articles*', {
      statusCode: 200,
      body: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    }).as('getFeed');

    visitAsAuthenticatedUser('/articles/create', testUser);
    cy.wait('@getTopics');
  });

  function completeArticleForm(): void {
    cy.get('#topic').select('topic-angular');
    cy.get('#title').type('Comprendre les signaux Angular');
    cy.get('#content').type('Les signaux permettent de représenter simplement un état réactif.');
  }

  it('publishes an article with the API then returns to the feed', () => {
    cy.intercept('POST', '**/api/v1/articles', {
      statusCode: 201,
      body: { id: 'article-1' },
    }).as('createArticle');

    completeArticleForm();
    cy.contains('button', 'Publier l’article').click();

    cy.wait('@createArticle').its('request.body').should('deep.equal', {
      topicId: 'topic-angular',
      title: 'Comprendre les signaux Angular',
      content: 'Les signaux permettent de représenter simplement un état réactif.',
    });
    cy.location('pathname').should('eq', '/feed');
  });

  it('shows a backend validation error beside the matching field', () => {
    cy.intercept('POST', '**/api/v1/articles', {
      statusCode: 400,
      body: {
        type: 'about:blank',
        title: 'Données invalides',
        status: 400,
        detail: 'La requête contient des données invalides.',
        instance: '/api/v1/articles',
        errors: {
          title: 'Ce titre est déjà utilisé.',
        },
      },
    }).as('createArticle');

    completeArticleForm();
    cy.contains('button', 'Publier l’article').click();

    cy.wait('@createArticle');
    cy.get('#title-error').should('contain.text', 'Ce titre est déjà utilisé.');
  });
});
