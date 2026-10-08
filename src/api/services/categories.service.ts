import { apiClient } from '../client';
import { Category } from '../../types';

export const categoriesService = {
  /**
   * Obtiene todas las categorías (GET /api/categories)
   */
  async getAll(): Promise<Category[]> {
    return apiClient<Category[]>('/categories');
  },

  /**
   * Crea una nueva categoría (POST /api/categories)
   */
  async create(data: Partial<Category>): Promise<Category> {
    return apiClient<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Actualiza una categoría existente (PUT /api/categories/:id)
   */
  async update(id: string, data: Partial<Category>): Promise<Category> {
    return apiClient<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Elimina una categoría (DELETE /api/categories/:id)
   */
  async delete(id: string): Promise<void> {
    return apiClient<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
