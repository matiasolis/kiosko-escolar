import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  marca: string;

  @Column({ name: 'categoria_id', type: 'varchar', length: 100 })
  categoriaId: string;

  @Column({ type: 'text', default: '' })
  descripcion: string;

  @Column({ type: 'text', default: '' })
  imagen: string;

  @Column({ name: 'precio_compra', type: 'decimal', precision: 12, scale: 2, default: 0 })
  precioCompra: number;

  @Column({ name: 'precio_venta', type: 'decimal', precision: 12, scale: 2, default: 0 })
  precioVenta: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 5 })
  stockMinimo: number;

  @Column({ type: 'varchar', length: 100, default: '' })
  sku: string;

  @Column({ type: 'varchar', length: 50, default: 'disponible' })
  estado: 'disponible' | 'stock_bajo' | 'agotado' | 'desactivado' | 'activo';

  @Column({ type: 'boolean', default: false })
  destacado: boolean;

  @Column({ name: 'en_promocion', type: 'boolean', default: false })
  enPromocion: boolean;

  @Column({ name: 'precio_promocional', type: 'decimal', precision: 12, scale: 2, nullable: true })
  precioPromocional: number | null;

  @Column({ name: 'fecha_vencimiento', type: 'varchar', length: 50, nullable: true })
  fechaVencimiento: string | null;

  @Column({ name: 'proveedor_id', type: 'varchar', length: 100, nullable: true })
  proveedorId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
