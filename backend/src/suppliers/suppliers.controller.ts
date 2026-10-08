import { Controller, Get } from '@nestjs/common';

@Controller('suppliers')
export class SuppliersController {
  private suppliers = [
    {
      id: 'sup_1',
      nombre: 'Distribuidora Arcor',
      contacto: 'Carlos Gómez',
      telefono: '11-4455-6677',
      email: 'ventas@arcor-distrib.com',
      direccion: 'Av. Corrientes 1234',
      diasEntrega: ['Lunes', 'Jueves'],
    },
    {
      id: 'sup_2',
      nombre: 'Bebidas del Plata',
      contacto: 'Mariana López',
      telefono: '11-9988-7766',
      email: 'pedidos@bebidasdelplata.com',
      direccion: 'Ruta 8 Km 45',
      diasEntrega: ['Martes', 'Viernes'],
    },
  ];

  @Get()
  getSuppliers() {
    return { suppliers: this.suppliers };
  }
}
