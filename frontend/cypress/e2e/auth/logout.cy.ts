import { visitAsAuthenticatedUser } from '../../support/auth';

describe('Déconnexion', () => {
  it('supprime la session et retourne à l’accueil public', () => {
    cy.intercept({ method: 'GET', pathname: '/api/v1/articles' }, {
      statusCode: 200,
      body: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    }).as('getFeed');

    visitAsAuthenticatedUser('/feed');
    cy.wait('@getFeed');
    cy.contains('button', 'Se déconnecter').click();

    cy.location('pathname').should('eq', '/');
    cy.window().then((window) => {
      expect(window.localStorage.getItem('orion_access_token')).to.be.null;
      expect(window.localStorage.getItem('orion_user')).to.be.null;
    });
  });
});
