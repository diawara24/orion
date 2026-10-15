import { visitAsAuthenticatedUser } from '../../support/auth';

describe('Navigation mobile', () => {
  it('présente le menu de navigation sur un écran mobile', () => {
    cy.viewport(390, 844);
    cy.intercept({ method: 'GET', pathname: '/api/v1/articles' }, {
      statusCode: 200,
      body: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    }).as('getFeed');

    visitAsAuthenticatedUser('/feed');
    cy.wait('@getFeed');

    cy.get('.navbar__mobile-menu > summary').should('be.visible').click();
    cy.get('.navbar__mobile-panel').should('be.visible');
    cy.get('.navbar__mobile-panel').contains('a', 'Articles').should('be.visible');
    cy.get('.navbar__mobile-panel').contains('a', 'Thèmes').should('be.visible');
  });
});
