import { Controller, Get } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller()
export class EventsController {
  private version = 1;

  constructor(private readonly ordersService: OrdersService) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('events/version')
  async getVersion() {
    const orders = await this.ordersService.findAll();
    const pendingOrdersCount = orders.filter((o) => o.estado === 'pendiente').length;

    return {
      version: this.version++,
      pendingOrdersCount,
      timestamp: Date.now(),
    };
  }
}
