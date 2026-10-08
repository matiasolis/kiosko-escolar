import { apiClient } from '../client';
import { User } from '../../types';

export const usersService = {
  /**
   * Obtiene la lista de todos los usuarios (GET /api/users)
   */
  async getAll(): Promise<User[]> {
    return apiClient<User[]>('/users');
  },

  /**
   * Obtiene un usuario por ID (GET /api/users/:id)
   */
  async getById(id: string): Promise<User> {
    return apiClient<User>(`/users/${id}`);
  },

  /**
   * Bloquea o desbloquea un usuario (PATCH /api/users/:id/block)
   */
  async setBlocked(id: string, isBlocked: boolean): Promise<User> {
    return apiClient<User>(`/users/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    });
  },
};
