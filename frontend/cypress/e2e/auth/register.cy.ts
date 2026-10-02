describe('Registration', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  function completeRegistrationForm(): void {
    cy.get('#username').type('orlando');
    cy.get('#email').type('orlando@example.com');
    cy.get('#password').type('Orion2026!');
  }

  it('creates an account then redirects the user to the login page', () => {
    cy.intercept('POST', '/api/v1/auth/register', {
      statusCode: 201,
      body: {
        id: '90e9d2cd-f3e3-4a95-8c5a-8794e7dff2e9',
        username: 'orlando',
        email: 'orlando@example.com',
        createdAt: '2026-10-02T10:00:00Z',
        updatedAt: '2026-10-02T10:00:00Z',
      },
    }).as('register');

    completeRegistrationForm();
    cy.contains('button', 'Créer mon compte').click();

    cy.wait('@register').its('request.body').should('deep.equal', {
      username: 'orlando',
      email: 'orlando@example.com',
      password: 'Orion2026!',
    });
    cy.location('pathname').should('eq', '/login');
  });

  it('displays a backend validation message below the invalid field', () => {
    cy.intercept('POST', '**/api/v1/auth/register', {
      statusCode: 400,
      body: {
        type: 'about:blank',
        title: 'Données invalides',
        status: 400,
        detail: 'La requête contient des données invalides.',
        instance: '/api/v1/auth/register',
        errors: {
          email: 'Cette adresse e-mail est déjà utilisée.',
        },
      },
    }).as('register');

    completeRegistrationForm();
    cy.contains('button', 'Créer mon compte').click();

    cy.wait('@register');
    cy.get('#email-error').should('contain.text', 'Cette adresse e-mail est déjà utilisée.');
  });

  it('displays a notification with the backend message for a global error', () => {
    cy.intercept('POST', '/api/v1/auth/register', {
      statusCode: 409,
      body: {
        type: 'about:blank',
        title: 'Conflit',
        status: 409,
        detail: 'Cette ressource existe déjà.',
        instance: '/api/v1/auth/register',
      },
    }).as('register');

    completeRegistrationForm();
    cy.contains('button', 'Créer mon compte').click();

    cy.wait('@register');
    cy.contains('Cette ressource existe déjà.').should('be.visible');
  });
});
