import { apiClient } from '../client';
import { Product } from '../../types';

export const productsService = {
  /**
   * Obtiene todos los productos (GET /api/products)
   */
  async getAll(categoriaId?: string): Promise<Product[]> {
    const query = categoriaId ? `?categoriaId=${encodeURIComponent(categoriaId)}` : '';
    return apiClient<Product[]>(`/products${query}`);
  },

  /**
   * Obtiene un producto por ID (GET /api/products/:id)
   */
  async getById(id: string): Promise<Product> {
    return apiClient<Product>(`/products/${id}`);
  },

  /**
   * Crea un producto nuevo (POST /api/products)
   */
  async create(data: Partial<Product>): Promise<Product> {
    return apiClient<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Actualiza un producto existente (PUT /api/products/:id)
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    return apiClient<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Ajusta el stock de un producto (PATCH /api/products/:id/stock)
   */
  async updateStock(id: string, delta: number): Promise<Product> {
    return apiClient<Product>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    });
  },

  /**
   * Elimina un producto (DELETE /api/products/:id)
   */
  async delete(id: string): Promise<void> {
    return apiClient<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
