import { visitAsAuthenticatedUser } from '../../support/auth';

describe('Thèmes', () => {
  it('abonne l’utilisateur puis rend le bouton inactif', () => {
    let subscribed = false;

    cy.intercept('GET', '**/api/v1/topics', (request) => {
      request.reply({
        statusCode: 200,
        body: [{
          id: 'topic-1',
          name: 'Angular',
          description: 'Actualités et ressources autour d’Angular.',
          subscribed,
        }],
      });
    }).as('getTopics');

    cy.intercept('PUT', '**/api/v1/topics/topic-1/subscription', (request) => {
      subscribed = true;
      request.reply({ statusCode: 204 });
    }).as('subscribe');

    visitAsAuthenticatedUser('/themes');
    cy.wait('@getTopics');

    cy.contains('button', 'S’abonner').click();
    cy.wait('@subscribe');
    cy.wait('@getTopics');
    cy.contains('button', 'Déjà abonné').should('be.disabled');
  });
});
