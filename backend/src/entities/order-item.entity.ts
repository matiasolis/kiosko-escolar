import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'varchar', length: 100 })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'producto_id', type: 'varchar', length: 100 })
  productoId: string;

  @Column({ name: 'producto_nombre', type: 'varchar', length: 200 })
  productoNombre: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  marca: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 12, scale: 2 })
  precioUnitario: number;

  @Column({ name: 'costo_unitario', type: 'decimal', precision: 12, scale: 2, default: 0 })
  costoUnitario: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'text', default: '' })
  imagen: string;
}
