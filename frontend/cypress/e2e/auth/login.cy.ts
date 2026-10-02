describe('Connexion', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('login user then redirect to feed page', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'test-access-token',
        tokenType: 'Bearer',
        user: {
          id: '90e9d2cd-f3e3-4a95-8c5a-8794e7dff2e9',
          username: 'orlando',
          email: 'orlando@example.com',
          createdAt: '2026-10-02T10:00:00Z',
          updatedAt: '2026-10-02T10:00:00Z',
        },
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
  });
});
