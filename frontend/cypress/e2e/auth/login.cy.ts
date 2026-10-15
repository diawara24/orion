import { testAccessToken, testUser } from '../../support/auth';

describe('Connexion', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('login user then redirect to feed page', () => {
    // Le feed est chargé après la redirection : on le simule pour éviter qu'un
    // 401 du backend local invalide volontairement le JWT de test.
    cy.intercept({ method: 'GET', pathname: '/api/v1/articles' }, {
      statusCode: 200,
      body: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    }).as('getFeed');

    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        accessToken: testAccessToken,
        tokenType: 'Bearer',
        user: testUser,
      },
    }).as('login');

    cy.get('#username').type('orlando');
    cy.get('#password').type('Orion2026!');
    cy.contains('button', 'Se connecter').click();

    cy.wait('@login').then(({ request, response }) => {
      expect(request.body).to.deep.equal({
        username: 'orlando',
        password: 'Orion2026!',
      });
      expect(response?.statusCode).to.equal(200);
    });

    cy.location('pathname').should('eq', '/feed');
    cy.wait('@getFeed');
    cy.window().then((window) => {
      expect(window.localStorage.getItem('orion_access_token')).to.equal(testAccessToken);
      expect(JSON.parse(window.localStorage.getItem('orion_user') ?? '{}')).to.deep.equal(testUser);
    });
  });
});
