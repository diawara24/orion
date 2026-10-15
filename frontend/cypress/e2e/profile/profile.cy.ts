import { visitAsAuthenticatedUser } from '../../support/auth';

const profile = {
  id: '90e9d2cd-f3e3-4a95-8c5a-8794e7dff2e9',
  username: 'orlando',
  email: 'orlando@example.com',
  createdAt: '2026-10-02T10:00:00Z',
  updatedAt: '2026-10-02T10:00:00Z',
  subscriptions: [{
    id: 'topic-1',
    name: 'Angular',
    description: 'Actualités et ressources autour d’Angular.',
    subscribed: true,
  }],
};

describe('Profil utilisateur', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/users/me', { statusCode: 200, body: profile }).as('getProfile');
    cy.intercept('GET', '**/api/v1/topics', { statusCode: 200, body: [] }).as('getTopics');
    visitAsAuthenticatedUser('/profile');
    cy.wait('@getProfile');
  });

  it('enregistre uniquement le champ de profil modifié', () => {
    cy.intercept('PATCH', '**/api/v1/users/me', {
      statusCode: 200,
      body: { ...profile, email: 'orlando.dev@example.com' },
    }).as('updateProfile');

    cy.get('#email').clear().type('orlando.dev@example.com');
    cy.contains('button', 'Sauvegarder').click();

    cy.wait('@updateProfile').its('request.body').should('deep.equal', {
      email: 'orlando.dev@example.com',
    });
  });

  it('désabonne un thème depuis le profil', () => {
    cy.intercept('DELETE', '**/api/v1/topics/topic-1/subscription', { statusCode: 204 }).as('unsubscribe');

    cy.contains('button', 'Se désabonner').click();
    cy.wait('@unsubscribe');
    cy.contains('h3', 'Angular').should('not.exist');
  });
});
