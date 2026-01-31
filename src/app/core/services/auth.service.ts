import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthState, LoginCredentials } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'auth_state';
  private readonly DEFAULT_CREDENTIALS = {
    login: 'admin',
    password: 'admin'
  };

  private authStateSubject: BehaviorSubject<AuthState>;
  public authState$: Observable<AuthState>;

  constructor() {
    const storedAuth = this.getStoredAuthState();
    this.authStateSubject = new BehaviorSubject<AuthState>(storedAuth);
    this.authState$ = this.authStateSubject.asObservable();
  }

  login(credentials: LoginCredentials): boolean {
    if (
      credentials.login === this.DEFAULT_CREDENTIALS.login &&
      credentials.password === this.DEFAULT_CREDENTIALS.password
    ) {
      const newState: AuthState = {
        isAuthenticated: true,
        user: credentials.login
      };
      this.updateAuthState(newState);
      return true;
    }
    return false;
  }

  logout(): void {
    const newState: AuthState = {
      isAuthenticated: false,
      user: null
    };
    this.updateAuthState(newState);
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getCurrentUser(): string | null {
    return this.authStateSubject.value.user;
  }

  private updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(state));
  }

  private getStoredAuthState(): AuthState {
    const stored = localStorage.getItem(this.AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isAuthenticated: false, user: null };
      }
    }
    return { isAuthenticated: false, user: null };
  }
}