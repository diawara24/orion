import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { User } from '../model/auth.model';


describe('AuthService', () => {
  // Déclaration des variables pour le service et le mock HTTP
  let service: AuthService;

  // Déclaration du mock HTTP
  let httpMock: HttpTestingController;

  // Définition d'un utilisateur de test pour les tests
  const user: User = {
    id: 'user-1',
    username: 'lea',
    email: 'lea@example.com',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  // Configuration du module de test avant chaque test
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });


    // Injection du mock HTTP
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Vérification qu'il n'y a pas de requêtes HTTP en attente après chaque test
  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // Test pour vérifier que le service est créé correctement
  it('est créé correctement', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  it('inscrit un utilisateur sans créer de session', () => {
    service = TestBed.inject(AuthService);
    const data = { username: 'lea', email: 'lea@example.com', password: 'secret' };

    service.register(data).subscribe();

    const request = httpMock.expectOne('/api/v1/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);
    request.flush(user);

    expect(localStorage.getItem('orion_access_token')).toBeNull();
  });

  it('envoie les identifiants de connexion et stocke le token et l\'utilisateur dans le localStorage', () => {
    service = TestBed.inject(AuthService);
    const credentials = { username: 'lea', password: 'secret' };
    const response = { accessToken: 'jwt-token', tokenType: 'Bearer' as const, user };

    service.login(credentials).subscribe();

    const request = httpMock.expectOne('/api/v1/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(response);

    expect(localStorage.getItem('orion_access_token')).toBe('jwt-token');
    expect(JSON.parse(localStorage.getItem('orion_user')!)).toEqual(user);
    expect(service.getCurrentUser()).toEqual(user);
  })

  it('efface la session à la déconnexion', () => {
    localStorage.setItem('orion_access_token', 'jwt-token');
    localStorage.setItem('orion_user', JSON.stringify(user));
    service = TestBed.inject(AuthService);

    service.logout();

    expect(localStorage.getItem('orion_access_token')).toBeNull();
    expect(localStorage.getItem('orion_user')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('supprime les données utilisateur stockées si le JSON est invalide', () => {
    localStorage.setItem('orion_user', 'json-invalide');
    service = TestBed.inject(AuthService);

    expect(service.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('orion_user')).toBeNull();
  });

  it('convertit une erreur HTTP de connexion en ApiError', () => {
    service = TestBed.inject(AuthService);
    let receivedError: unknown;

    service.login({ username: 'lea', password: 'incorrect' }).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    const request = httpMock.expectOne('/api/v1/auth/login');
    request.flush(
      {
        type: 'about:blank',
        title: 'Non autorisé',
        status: 401,
        detail: 'Identifiants incorrects.',
        instance: '/auth/login',
      },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(receivedError).toMatchObject({
      status: 401,
      title: 'Non autorisé',
      detail: 'Identifiants incorrects.',
    });
  });

});
