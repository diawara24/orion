export const testAccessToken = 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDI0NDQ4MDB9.signature';

export const testUser = {
  id: '90e9d2cd-f3e3-4a95-8c5a-8794e7dff2e9',
  username: 'orlando',
  email: 'orlando@example.com',
  createdAt: '2026-10-02T10:00:00Z',
  updatedAt: '2026-10-02T10:00:00Z',
};

/** Ouvre une route protégée avec un JWT lisible et non expiré par le guard. */
export function visitAsAuthenticatedUser(path: string, user = testUser): void {
  cy.visit(path, {
    onBeforeLoad(window) {
      window.localStorage.setItem('orion_access_token', testAccessToken);
      window.localStorage.setItem('orion_user', JSON.stringify(user));
    },
  });
}
