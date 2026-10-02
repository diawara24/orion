import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchApiError } from '../http/catch-api-error.operator';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
  User,
} from '../model/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'orion_access_token';
  private readonly userKey = 'orion_user';
  private readonly apiBaseUrl =
    'apiBaseUrl' in environment && typeof environment.apiBaseUrl === 'string'
      ? environment.apiBaseUrl.replace(/\/$/, '')
      : '/api/v1';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly http = inject(HttpClient);


  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, credentials)
      .pipe(
        catchApiError(),
        tap((response) => this.storeSession(response))
      );
  }

  register(data: RegisterRequest): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${this.apiBaseUrl}/auth/register`, data)
      .pipe(catchApiError());
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private storeSession(response: LoginResponse): void {
    if (response.accessToken) {
      localStorage.setItem(this.tokenKey, response.accessToken);
    }

    if (response.user) {
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as User;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
