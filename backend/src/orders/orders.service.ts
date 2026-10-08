import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(clienteId?: string): Promise<Order[]> {
    if (clienteId) {
      return this.orderRepository.find({
        where: { clienteId },
        order: { createdAt: 'DESC' },
      });
    }
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1. Validate items and stock
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El pedido debe tener al menos un producto.');
    }

    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productoId);
      if (product.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock}, Solicitado: ${item.cantidad}`,
        );
      }
    }

    // 2. Determine next order number
    const totalOrders = await this.orderRepository.count();
    const numeroPedido = 100 + totalOrders + 1;
    const orderId = `ord_${Date.now()}`;

    // 3. Create Order Items and decrease stock
    let totalCosto = 0;
    const orderItems: OrderItem[] = [];

    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productoId);
      const costoUnitario = Number(product.precioCompra) || 0;
      totalCosto += costoUnitario * item.cantidad;

      // Deduce stock
      await this.productsService.updateStock(item.productoId, -item.cantidad);

      const orderItem = this.orderItemRepository.create({
        orderId,
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        marca: item.marca || product.marca || '',
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario),
        costoUnitario,
        subtotal: Number(item.subtotal),
        imagen: item.imagen || product.imagen || '',
      });
      orderItems.push(orderItem);
    }

    const total = Number(dto.total);
    const gananciaEstimada = Math.max(0, total - totalCosto);

    const order = this.orderRepository.create({
      id: orderId,
      numeroPedido,
      clienteId: dto.clienteId,
      clienteNombre: dto.clienteNombre,
      clienteVisible: dto.clienteVisible,
      clienteEmail: dto.clienteEmail,
      items: orderItems,
      total,
      costoTotal: totalCosto,
      gananciaEstimada,
      metodoPago: dto.metodoPago,
      estadoPago: dto.estadoPago || (dto.metodoPago === 'efectivo' ? 'pendiente' : 'confirmado'),
      modalidadRetiro: dto.modalidadRetiro,
      recreoDestino: dto.recreoDestino || null,
      estado: 'pendiente',
      notas: dto.notas || null,
      comprobantePago: dto.comprobantePago || null,
    });

    return this.orderRepository.save(order);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);

    // If cancelling an order, restore product stock
    if (dto.estado === 'cancelado' && order.estado !== 'cancelado') {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          try {
            await this.productsService.updateStock(item.productoId, item.cantidad);
          } catch {
            // Ignore if product was deleted
          }
        }
      }
    }

    if (dto.estado) order.estado = dto.estado;
    if (dto.estadoPago) order.estadoPago = dto.estadoPago;
    if (dto.comprobantePago !== undefined) order.comprobantePago = dto.comprobantePago;

    return this.orderRepository.save(order);
  }
}
