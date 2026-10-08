import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string;

  @Column({ name: 'numero_pedido', type: 'int' })
  numeroPedido: number;

  @Column({ name: 'cliente_id', type: 'varchar', length: 100 })
  clienteId: string;

  @Column({ name: 'cliente_nombre', type: 'varchar', length: 150 })
  clienteNombre: string;

  @Column({ name: 'cliente_visible', type: 'varchar', length: 100 })
  clienteVisible: string;

  @Column({ name: 'cliente_email', type: 'varchar', length: 254 })
  clienteEmail: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ name: 'costo_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  costoTotal: number;

  @Column({ name: 'ganancia_estimada', type: 'decimal', precision: 12, scale: 2, default: 0 })
  gananciaEstimada: number;

  @Column({ name: 'metodo_pago', type: 'varchar', length: 50, default: 'efectivo' })
  metodoPago: 'efectivo' | 'mercadopago' | 'transferencia';

  @Column({ name: 'estado_pago', type: 'varchar', length: 50, default: 'pendiente' })
  estadoPago: 'pendiente' | 'confirmado' | 'rechazado';

  @Column({ name: 'modalidad_retiro', type: 'varchar', length: 50, default: 'inmediato' })
  modalidadRetiro: 'inmediato' | 'recreo';

  @Column({ name: 'recreo_destino', type: 'varchar', length: 150, nullable: true })
  recreoDestino: string | null;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @Column({ name: 'comprobante_pago', type: 'text', nullable: true })
  comprobantePago: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
