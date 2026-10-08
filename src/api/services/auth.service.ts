import { apiClient } from '../client';
import { User } from '../../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  nombreVisible: string;
  tipoAlumno?: 'digital' | 'colaborador';
}

export const authService = {
  /**
   * Inicia sesión contra el backend NestJS (POST /api/auth/login)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Registra un nuevo alumno/usuario contra el backend NestJS (POST /api/auth/register)
   */
  async register(data: RegisterPayload): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtiene el perfil del usuario autenticado (GET /api/auth/me)
   */
  async getProfile(): Promise<{ user: User }> {
    return apiClient<{ user: User }>('/auth/me', {
      method: 'GET',
    });
  },
};
