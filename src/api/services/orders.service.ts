import { apiClient } from '../client';
import { Order } from '../../types';

export const ordersService = {
  /**
   * Obtiene la lista de pedidos (GET /api/orders)
   * Si se provee clienteId, filtra por ese cliente.
   */
  async getAll(clienteId?: string): Promise<Order[]> {
    const query = clienteId ? `?clienteId=${encodeURIComponent(clienteId)}` : '';
    return apiClient<Order[]>(`/orders${query}`);
  },

  /**
   * Obtiene un pedido por ID (GET /api/orders/:id)
   */
  async getById(id: string): Promise<Order> {
    return apiClient<Order>(`/orders/${id}`);
  },

  /**
   * Crea un nuevo pedido con descuento de stock (POST /api/orders)
   */
  async create(orderData: Partial<Order>): Promise<Order> {
    return apiClient<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Actualiza el estado de un pedido (PATCH /api/orders/:id/status)
   */
  async updateStatus(
    id: string,
    statusData: {
      estado?: Order['estado'];
      estadoPago?: Order['estadoPago'];
      comprobantePago?: string;
    },
  ): Promise<Order> {
    return apiClient<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },
};
