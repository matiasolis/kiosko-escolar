import { pgTable, text, integer, boolean, timestamp, real, jsonb, serial } from 'drizzle-orm/pg-core';

// Users table (links with Firebase Auth or local credentials)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system user ID
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('cliente'), // 'admin' | 'cliente'
  nombre: text('nombre').notNull().default(''),
  apellido: text('apellido').notNull().default(''),
  nombreVisible: text('nombre_visible').notNull().default(''),
  isBlocked: boolean('is_blocked').notNull().default(false),
  totalSpent: real('total_spent').notNull().default(0),
  orderCount: integer('order_count').notNull().default(0),
  favorites: jsonb('favorites').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  icono: text('icono').notNull().default('CupSoda'),
  activa: boolean('activa').notNull().default(true),
  orden: integer('orden').notNull().default(0),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  marca: text('marca').notNull().default(''),
  categoriaId: text('categoria_id').notNull(),
  descripcion: text('descripcion').notNull().default(''),
  imagen: text('imagen').notNull().default(''),
  precioCompra: real('precio_compra').notNull().default(0),
  precioVenta: real('precio_venta').notNull().default(0),
  stock: integer('stock').notNull().default(0),
  stockMinimo: integer('stock_minimo').notNull().default(5),
  sku: text('sku').notNull().default(''),
  estado: text('estado').notNull().default('disponible'), // 'disponible' | 'stock_bajo' | 'agotado' | 'desactivado'
  destacado: boolean('destacado').notNull().default(false),
  enPromocion: boolean('en_promocion').notNull().default(false),
  precioPromocional: real('precio_promocional'),
  fechaVencimiento: text('fecha_vencimiento'),
  proveedorId: text('proveedor_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  numeroPedido: text('numero_pedido').notNull().unique(),
  usuarioId: text('usuario_id').notNull(),
  usuarioNombre: text('usuario_nombre').notNull(),
  usuarioEmail: text('usuario_email').notNull(),
  items: jsonb('items').notNull(),
  total: real('total').notNull(),
  totalCosto: real('total_costo').notNull().default(0),
  gananciaNeta: real('ganancia_neta').notNull().default(0),
  metodoPago: text('metodo_pago').notNull().default('efectivo'), // 'efectivo' | 'mercadopago' | 'saldo'
  estado: text('estado').notNull().default('pendiente'), // 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado'
  comprobantePago: text('comprobante_pago'),
  fechaRetiroProgramada: text('fecha_retiro_programada'),
  recreoDestino: text('recreo_destino'),
  notas: text('notas'),
  fecha: timestamp('fecha').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Stock Movements
export const stockMovements = pgTable('stock_movements', {
  id: text('id').primaryKey(),
  productoId: text('producto_id').notNull(),
  productoNombre: text('producto_nombre').notNull(),
  tipo: text('tipo').notNull(), // 'entrada' | 'salida'
  cantidad: integer('cantidad').notNull(),
  stockAnterior: integer('stock_anterior').notNull(),
  stockNuevo: integer('stock_nuevo').notNull(),
  motivo: text('motivo').notNull(),
  usuarioNombre: text('usuario_nombre').notNull(),
  fecha: timestamp('fecha').defaultNow(),
});

// Suppliers
export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  contacto: text('contacto').default(''),
  telefono: text('telefono').default(''),
  email: text('email').default(''),
  rubro: text('rubro').default('Golosinas y Bebidas'),
  diasEntrega: text('dias_entrega').default(''),
});

// Purchases from suppliers
export const purchases = pgTable('purchases', {
  id: text('id').primaryKey(),
  proveedorId: text('proveedor_id').notNull(),
  proveedorNombre: text('proveedor_nombre').notNull(),
  items: jsonb('items').notNull(),
  total: real('total').notNull(),
  numeroFactura: text('numero_factura').default(''),
  fecha: timestamp('fecha').defaultNow(),
  usuarioNombre: text('usuario_nombre').notNull().default('Administrador'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activity logs
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  usuarioNombre: text('usuario_nombre').notNull(),
  accion: text('accion').notNull(),
  detalle: text('detalle').notNull(),
  tipo: text('tipo').notNull().default('info'), // 'stock' | 'pedido' | 'precio' | 'sistema' | 'info'
  fecha: timestamp('fecha').defaultNow(),
});

// Kiosk settings
export const kioskSettings = pgTable('kiosk_settings', {
  id: text('id').primaryKey().default('global'),
  nombreKiosco: text('nombre_kiosco').notNull().default('kiosControl'),
  abierto: boolean('abierto').notNull().default(true),
  horaApertura: text('hora_apertura').notNull().default('07:30'),
  horaCierre: text('hora_cierre').notNull().default('18:00'),
  mensajeCierre: text('mensaje_cierre').notNull().default('El kiosco se encuentra cerrado temporalmente.'),
  aliasMp: text('alias_mp').notNull().default('kioscontrol.mp'),
  titularMp: text('titular_mp').notNull().default('Asociación Cooperadora Escolar'),
  cbuMp: text('cbu_mp').notNull().default('0000003100012345678901'),
  recreos: jsonb('recreos').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
