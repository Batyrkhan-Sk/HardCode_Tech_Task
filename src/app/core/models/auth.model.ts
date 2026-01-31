export interface LoginCredentials {
  login: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
}