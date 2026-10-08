import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Category,
  Product,
  StockMovement,
  Order,
  Supplier,
  SupplierPurchase,
  ActivityLog,
  KioskSettings,
  FinanceStats,
  AppNotification,
  CashRegisterClosure,
  TipoAlumno,
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kiosco.json');

export interface DatabaseSchema {
  version: number;
  lastUpdated: number;
  users: User[];
  categories: Category[];
  products: Product[];
  stockMovements: StockMovement[];
  orders: Order[];
  suppliers: Supplier[];
  purchases: SupplierPurchase[];
  activityLogs: ActivityLog[];
  settings: KioskSettings;
  notifications: AppNotification[];
  cashClosures: CashRegisterClosure[];
}

// In-memory cache for speed with atomic sync to disk
let dbMemory: DatabaseSchema | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const alumnoPasswordHash = bcrypt.hashSync('alumno123', salt);

  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: 'usr_admin_1',
      email: 'admin@kiosco.edu',
      role: 'admin',
      nombre: 'Prof. Roberto',
      apellido: 'Gómez',
      nombreVisible: 'Roberto',
      isBlocked: false,
      createdAt: now,
      totalSpent: 0,
      orderCount: 0,
      favorites: [],
    },
    {
      id: 'usr_alumno_1',
      email: 'matias@alumno.edu',
      role: 'cliente',
      tipoAlumno: 'digital',
      nombre: 'Matías',
      apellido: 'Olís',
      nombreVisible: 'Matias',
      isBlocked: false,
      createdAt: now,
      totalSpent: 4200,
      orderCount: 2,
      favorites: ['prod_coca', 'prod_alfajor_havanna'],
    },
    {
      id: 'usr_alumno_2',
      email: 'sofia@alumno.edu',
      role: 'cliente',
      tipoAlumno: 'colaborador',
      nombre: 'Sofía',
      apellido: 'Martínez',
      nombreVisible: 'Sofi',
      isBlocked: false,
      createdAt: now,
      totalSpent: 2800,
      orderCount: 1,
      favorites: ['prod_agua', 'prod_barrita'],
    },
  ];

  const categories: Category[] = [
    { id: 'bebidas', nombre: 'Bebidas', icono: 'CupSoda', activa: true, orden: 1 },
    { id: 'alfajores', nombre: 'Alfajores', icono: 'Cookie', activa: true, orden: 2 },
    { id: 'golosinas', nombre: 'Golosinas', icono: 'Candy', activa: true, orden: 3 },
    { id: 'snacks', nombre: 'Snacks', icono: 'Popcorn', activa: true, orden: 4 },
    { id: 'comida', nombre: 'Comida Caliente & Sándwiches', icono: 'Sandwich', activa: true, orden: 5 },
    { id: 'saludable', nombre: 'Opciones Saludables', icono: 'Apple', activa: true, orden: 6 },
    { id: 'libreria', nombre: 'Librería y Útiles', icono: 'PenTool', activa: true, orden: 7 },
  ];

  const products: Product[] = [
    {
      id: 'prod_coca',
      nombre: 'Coca-Cola 500ml',
      marca: 'Coca-Cola',
      categoriaId: 'bebidas',
      descripcion: 'Gaseosa refrescante sabor original en botella de 500ml bien fría.',
      imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
      precioCompra: 1100,
      precioVenta: 1800,
      stock: 24,
      stockMinimo: 6,
      sku: 'BEB-001',
      estado: 'disponible',
      destacado: true,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_agua',
      nombre: 'Agua Mineral Villavicencio 500ml',
      marca: 'Villavicencio',
      categoriaId: 'bebidas',
      descripcion: 'Agua mineral de manantial natural sin gas.',
      imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
      precioCompra: 700,
      precioVenta: 1200,
      stock: 18,
      stockMinimo: 5,
      sku: 'BEB-002',
      estado: 'disponible',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_aquarius',
      nombre: 'Aquarius Manzana 500ml',
      marca: 'Aquarius',
      categoriaId: 'bebidas',
      descripcion: 'Agua saborizada de manzana con jugo natural de frutas.',
      imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      precioCompra: 950,
      precioVenta: 1500,
      stock: 12,
      stockMinimo: 4,
      sku: 'BEB-003',
      estado: 'disponible',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_alfajor_havanna',
      nombre: 'Alfajor Havanna 70% Cacao',
      marca: 'Havanna',
      categoriaId: 'alfajores',
      descripcion: 'Relleno de abundante dulce de leche y cobertura de chocolate amargo 70%.',
      imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
      precioCompra: 1400,
      precioVenta: 2200,
      stock: 15,
      stockMinimo: 5,
      sku: 'ALF-001',
      estado: 'disponible',
      destacado: true,
      enPromocion: true,
      precioPromocional: 2000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_alfajor_guaymallen',
      nombre: 'Alfajor Guaymallén Triple Blanco',
      marca: 'Guaymallén',
      categoriaId: 'alfajores',
      descripcion: 'El clásico de los recreos con triple capa y dulce de leche cremoso.',
      imagen: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
      precioCompra: 450,
      precioVenta: 800,
      stock: 35,
      stockMinimo: 10,
      sku: 'ALF-002',
      estado: 'disponible',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_capitan',
      nombre: 'Alfajor Capitán del Espacio Triple',
      marca: 'Capitán del Espacio',
      categoriaId: 'alfajores',
      descripcion: 'Legendario alfajor triple bañado en chocolate con corazón de dulce de leche.',
      imagen: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&auto=format&fit=crop&q=80',
      precioCompra: 900,
      precioVenta: 1500,
      stock: 8,
      stockMinimo: 5,
      sku: 'ALF-003',
      estado: 'disponible',
      destacado: true,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_doritos',
      nombre: 'Doritos Queso Nacho 95g',
      marca: 'Doritos',
      categoriaId: 'snacks',
      descripcion: 'Totopos crujientes de maíz con intenso sabor a queso nacho.',
      imagen: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
      precioCompra: 1200,
      precioVenta: 1900,
      stock: 4,
      stockMinimo: 5,
      sku: 'SNK-001',
      estado: 'stock_bajo',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_lays',
      nombre: 'Papas Lays Clásicas 85g',
      marca: 'Lay\'s',
      categoriaId: 'snacks',
      descripcion: 'Papas fritas cortadas finas y crocantes con sal marina.',
      imagen: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=600&auto=format&fit=crop&q=80',
      precioCompra: 1100,
      precioVenta: 1750,
      stock: 14,
      stockMinimo: 5,
      sku: 'SNK-002',
      estado: 'disponible',
      destacado: true,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_tostado',
      nombre: 'Tostado de Jamón y Queso en Pan de Miga',
      marca: 'Kiosco Elaboración Propia',
      categoriaId: 'comida',
      descripcion: 'Preparado y tostado al momento con abundante jamón cocido y queso muzzarella fundido.',
      imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
      precioCompra: 1500,
      precioVenta: 2600,
      stock: 10,
      stockMinimo: 3,
      sku: 'CMD-001',
      estado: 'disponible',
      destacado: true,
      enPromocion: true,
      precioPromocional: 2400,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_empanada',
      nombre: 'Empanada de Carne Cortada a Cuchillo',
      marca: 'Kiosco Elaboración Propia',
      categoriaId: 'comida',
      descripcion: 'Empanada horneada caliente y jugosa, lista para comer en el recreo.',
      imagen: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
      precioCompra: 850,
      precioVenta: 1400,
      stock: 0,
      stockMinimo: 4,
      sku: 'CMD-002',
      estado: 'agotado',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_beldent',
      nombre: 'Chicle Beldent Menta Infini',
      marca: 'Beldent',
      categoriaId: 'golosinas',
      descripcion: 'Goma de mascar sin azúcar con sabor menta de larga duración.',
      imagen: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80',
      precioCompra: 500,
      precioVenta: 900,
      stock: 28,
      stockMinimo: 6,
      sku: 'GOL-001',
      estado: 'disponible',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_barrita',
      nombre: 'Barra de Cereal Flow Avena y Frutos Rojos',
      marca: 'Flow Cereales',
      categoriaId: 'saludable',
      descripcion: 'Barra energética natural rica en fibras y sin grasas trans.',
      imagen: 'https://images.unsplash.com/photo-1622484214647-8149e830e713?w=600&auto=format&fit=crop&q=80',
      precioCompra: 600,
      precioVenta: 1100,
      stock: 20,
      stockMinimo: 5,
      sku: 'SAL-001',
      estado: 'disponible',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_cuaderno_a4',
      nombre: 'Cuaderno Rivadavia Rayado Tapa Dura A4',
      marca: 'Rivadavia',
      categoriaId: 'libreria',
      descripcion: 'Cuaderno escolar clásico de 100 hojas rayadas de alto gramaje para clases y apuntes.',
      imagen: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      precioCompra: 1800,
      precioVenta: 2900,
      stock: 16,
      stockMinimo: 5,
      sku: 'LIB-001',
      estado: 'disponible',
      destacado: true,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_lapicera_bic',
      nombre: 'Bolígrafo Bic Cristal Azul Trazo Fino',
      marca: 'Bic',
      categoriaId: 'libreria',
      descripcion: 'Bolígrafo legendario de escritura suave y duradera con tapa ventilada de seguridad.',
      imagen: 'https://images.unsplash.com/photo-1585336261026-40742f9e4f55?w=600&auto=format&fit=crop&q=80',
      precioCompra: 350,
      precioVenta: 650,
      stock: 30,
      stockMinimo: 10,
      sku: 'LIB-002',
      estado: 'disponible',
      destacado: false,
      enPromocion: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_resaltador_faber',
      nombre: 'Resaltador Flúo Faber-Castell Textliner',
      marca: 'Faber-Castell',
      categoriaId: 'libreria',
      descripcion: 'Marcador fluorescente amarillo con punta biselada en tres anchos de trazo.',
      imagen: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=600&auto=format&fit=crop&q=80',
      precioCompra: 650,
      precioVenta: 1100,
      stock: 22,
      stockMinimo: 6,
      sku: 'LIB-003',
      estado: 'disponible',
      destacado: true,
      enPromocion: true,
      precioPromocional: 950,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const stockMovements: StockMovement[] = [
    {
      id: 'mov_1',
      productoId: 'prod_coca',
      productoNombre: 'Coca-Cola 500ml',
      tipo: 'entrada',
      cantidad: 24,
      stockPrevio: 0,
      stockPosterior: 24,
      motivo: 'Compra a proveedor Distribuidora Bebidas',
      usuarioId: 'usr_admin_1',
      usuarioNombre: 'Roberto',
      fecha: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: 'mov_2',
      productoId: 'prod_alfajor_havanna',
      productoNombre: 'Alfajor Havanna 70% Cacao',
      tipo: 'entrada',
      cantidad: 20,
      stockPrevio: 0,
      stockPosterior: 20,
      motivo: 'Compra inicial de stock',
      usuarioId: 'usr_admin_1',
      usuarioNombre: 'Roberto',
      fecha: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: 'mov_3',
      productoId: 'prod_empanada',
      productoNombre: 'Empanada de Carne Cortada a Cuchillo',
      tipo: 'salida',
      cantidad: -2,
      stockPrevio: 2,
      stockPosterior: 0,
      motivo: 'Producto vencido / descarte del día anterior',
      usuarioId: 'usr_admin_1',
      usuarioNombre: 'Roberto',
      fecha: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord_101',
      numeroPedido: 101,
      clienteId: 'usr_alumno_1',
      clienteNombre: 'Matías Olís',
      clienteVisible: 'Matias',
      clienteEmail: 'matias@alumno.edu',
      items: [
        {
          productoId: 'prod_coca',
          productoNombre: 'Coca-Cola 500ml',
          marca: 'Coca-Cola',
          cantidad: 1,
          precioUnitario: 1800,
          costoUnitario: 1100,
          subtotal: 1800,
          imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        },
        {
          productoId: 'prod_alfajor_havanna',
          productoNombre: 'Alfajor Havanna 70% Cacao',
          marca: 'Havanna',
          cantidad: 1,
          precioUnitario: 2000,
          costoUnitario: 1400,
          subtotal: 2000,
          imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
        },
      ],
      total: 3800,
      costoTotal: 2500,
      gananciaEstimada: 1300,
      metodoPago: 'mercadopago',
      estadoPago: 'confirmado',
      modalidadRetiro: 'recreo',
      recreoHora: '10:15 - Primer Recreo',
      estado: 'entregado',
      fecha: new Date(Date.now() - 3600000 * 20).toISOString(),
      comprobanteId: 'COMP-101-9842',
      updatedAt: new Date(Date.now() - 3600000 * 19).toISOString(),
    },
    {
      id: 'ord_102',
      numeroPedido: 102,
      clienteId: 'usr_alumno_2',
      clienteNombre: 'Sofía Martínez',
      clienteVisible: 'Sofi',
      clienteEmail: 'sofia@alumno.edu',
      items: [
        {
          productoId: 'prod_tostado',
          productoNombre: 'Tostado de Jamón y Queso en Pan de Miga',
          marca: 'Kiosco',
          cantidad: 1,
          precioUnitario: 2400,
          costoUnitario: 1500,
          subtotal: 2400,
          imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
        },
      ],
      total: 2400,
      costoTotal: 1500,
      gananciaEstimada: 900,
      metodoPago: 'efectivo',
      estadoPago: 'confirmado',
      modalidadRetiro: 'inmediato',
      estado: 'listo',
      fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
      comprobanteId: 'COMP-102-1784',
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 'ord_103',
      numeroPedido: 103,
      clienteId: 'usr_alumno_1',
      clienteNombre: 'Matías Olís',
      clienteVisible: 'Matias',
      clienteEmail: 'matias@alumno.edu',
      items: [
        {
          productoId: 'prod_lays',
          productoNombre: 'Papas Lays Clásicas 85g',
          marca: 'Lay\'s',
          cantidad: 1,
          precioUnitario: 1750,
          costoUnitario: 1100,
          subtotal: 1750,
          imagen: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=600&auto=format&fit=crop&q=80',
        },
        {
          productoId: 'prod_beldent',
          productoNombre: 'Chicle Beldent Menta Infini',
          marca: 'Beldent',
          cantidad: 1,
          precioUnitario: 900,
          costoUnitario: 500,
          subtotal: 900,
          imagen: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80',
        },
      ],
      total: 2650,
      costoTotal: 1600,
      gananciaEstimada: 1050,
      metodoPago: 'mercadopago',
      estadoPago: 'confirmado',
      modalidadRetiro: 'recreo',
      recreoHora: '12:00 - Segundo Recreo',
      estado: 'pendiente',
      fecha: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      comprobanteId: 'COMP-103-3451',
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: 'prov_1',
      nombre: 'Distribuidora Golomax S.A.',
      telefono: '011-4567-8900',
      email: 'ventas@golomax.com.ar',
      contacto: 'Carlos Varela',
      productosAsociados: ['prod_alfajor_guaymallen', 'prod_beldent'],
      totalComprado: 68500,
      ultimaCompra: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },
    {
      id: 'prov_2',
      nombre: 'Bebidas del Valle SRL',
      telefono: '011-5678-1234',
      email: 'pedidos@bebidasdelvalle.com',
      contacto: 'Mariana Pérez',
      productosAsociados: ['prod_coca', 'prod_agua', 'prod_aquarius'],
      totalComprado: 124000,
      ultimaCompra: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },
    {
      id: 'prov_3',
      nombre: 'Panificadora Central',
      telefono: '011-4433-2211',
      email: 'central@panificadora.com',
      contacto: 'Esteban Domínguez',
      productosAsociados: ['prod_tostado', 'prod_empanada'],
      totalComprado: 45000,
      ultimaCompra: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    },
  ];

  const purchases: SupplierPurchase[] = [
    {
      id: 'pur_1',
      proveedorId: 'prov_2',
      proveedorNombre: 'Bebidas del Valle SRL',
      items: [
        {
          productoId: 'prod_coca',
          productoNombre: 'Coca-Cola 500ml',
          cantidad: 48,
          precioCosto: 1100,
          subtotal: 52800,
        },
        {
          productoId: 'prod_agua',
          productoNombre: 'Agua Mineral Villavicencio 500ml',
          cantidad: 36,
          precioCosto: 700,
          subtotal: 25200,
        },
      ],
      total: 78000,
      fecha: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      notas: 'Entrega en puerta del colegio con remito #4582',
    },
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: 'act_1',
      usuarioId: 'usr_admin_1',
      usuarioNombre: 'Roberto',
      accion: 'Modificación de precio',
      elementoAfectado: 'Coca-Cola 500ml',
      detalle: 'Actualizó el precio de venta a $1.800',
      fecha: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'act_2',
      usuarioId: 'usr_admin_1',
      usuarioNombre: 'Roberto',
      accion: 'Ingreso de compra a proveedor',
      elementoAfectado: 'Bebidas del Valle SRL',
      detalle: 'Registró compra #pur_1 por $78.000 y actualizó stock',
      fecha: new Date(Date.now() - 3600000 * 40).toISOString(),
    },
    {
      id: 'act_3',
      usuarioId: 'usr_admin_1',
      usuarioNombre: 'Roberto',
      accion: 'Entrega de pedido',
      elementoAfectado: 'Pedido #101',
      detalle: 'Marcó pedido de Matías Olís como entregado',
      fecha: new Date(Date.now() - 3600000 * 19).toISOString(),
    },
  ];

  const settings: KioskSettings = {
    nombreKiosco: 'kiosControl',
    logoUrl: '',
    aliasMp: 'kioscontrol.mp',
    cbuMp: '0000003100012345678901',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https%3A%2F%2Fmpago.la%2Fpos%2Fkioscontrol',
    telefonoContacto: '+54 11 4567-8900',
    horarioAtencion: 'Lunes a Viernes de 07:30 a 17:00 hs',
    permitirPedidosRecreo: true,
    notificacionesSonido: true,
    recreosDisponibles: [
      '09:15 - Recreo Mañana (15 min)',
      '10:45 - Recreo Principal (20 min)',
      '12:15 - Almuerzo escolar',
      '14:30 - Recreo Tarde (15 min)',
    ],
  };

  const notifications: AppNotification[] = [
    {
      id: 'notif_1',
      targetRole: 'admin',
      titulo: 'Pedidos pendientes de preparación',
      mensaje: 'Hay 2 pedidos pendientes en espera para el próximo recreo escolar.',
      categoria: 'pedidos',
      fecha: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      leida: false,
      prioridad: 'alta',
      actionTab: 'orders',
    },
    {
      id: 'notif_2',
      targetRole: 'admin',
      titulo: 'Alerta de stock bajo',
      mensaje: 'El stock de Coca-Cola 500ml y Jugo Baggio está cerca del mínimo sugerido.',
      categoria: 'stock',
      fecha: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      leida: false,
      prioridad: 'alta',
      actionTab: 'stock',
    },
    {
      id: 'notif_3',
      targetRole: 'admin',
      titulo: 'Caja del día pendiente de cierre',
      mensaje: 'La caja de la jornada todavía no fue cerrada formalmente.',
      categoria: 'caja',
      fecha: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      leida: false,
      prioridad: 'normal',
      actionTab: 'cash',
    },
    {
      id: 'notif_4',
      targetRole: 'admin',
      titulo: 'Carga de productos habilitada',
      mensaje: 'Se cargaron nuevos productos mediante importación masiva de Excel.',
      categoria: 'excel',
      fecha: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      leida: true,
      prioridad: 'baja',
      actionTab: 'products',
    },
    {
      id: 'notif_5',
      targetRole: 'cliente',
      targetUserId: 'usr_alumno_1',
      titulo: '¡Tu pedido #101 fue entregado!',
      mensaje: 'Retiraste tu pedido con éxito en el mostrador del kiosco. ¡Que lo disfrutes!',
      categoria: 'pedidos',
      fecha: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      leida: false,
      prioridad: 'normal',
      actionTab: 'orders',
    },
    {
      id: 'notif_6',
      targetRole: 'all',
      titulo: 'Nueva promoción disponible',
      mensaje: 'Aprovechá la promoción de 2x1 en Alfajores Havanna para el recreo.',
      categoria: 'promociones',
      fecha: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      leida: false,
      prioridad: 'normal',
      actionTab: 'catalog',
    },
    {
      id: 'notif_7',
      targetRole: 'all',
      titulo: 'Nuevo producto en Kios Mercado',
      mensaje: 'Ya podés encontrar Tostados de Jamón y Queso recién preparados en el kiosco.',
      categoria: 'institucional',
      fecha: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      leida: true,
      prioridad: 'baja',
      actionTab: 'catalog',
    },
  ];

  const cashClosures: CashRegisterClosure[] = [
    {
      id: 'close_2026-09-28',
      fecha: '2026-09-28',
      horaApertura: '07:30',
      horaCierre: '17:15',
      responsableId: 'usr_admin_1',
      responsableNombre: 'Prof. Roberto Gómez',
      ventasTotales: 42500,
      ventasEfectivo: 27500,
      ventasTransferencia: 15000,
      ventasOtros: 0,
      gastosTotales: 3500,
      resultadoEsperado: 24000,
      dineroContado: 24000,
      diferencia: 0,
      estado: 'cerrada',
      observaciones: 'Cierre de caja de la jornada anterior balanceado sin diferencias.',
      cerradoEn: '2026-09-28T17:15:00.000Z',
    },
    {
      id: 'close_2026-09-27',
      fecha: '2026-09-27',
      horaApertura: '07:30',
      horaCierre: '17:05',
      responsableId: 'usr_admin_1',
      responsableNombre: 'Prof. Roberto Gómez',
      ventasTotales: 38900,
      ventasEfectivo: 23900,
      ventasTransferencia: 15000,
      ventasOtros: 0,
      gastosTotales: 2000,
      resultadoEsperado: 21900,
      dineroContado: 22000,
      diferencia: 100,
      estado: 'cerrada',
      observaciones: 'Sobrante menor por redondeo de cambio en recreos.',
      cerradoEn: '2026-09-27T17:05:00.000Z',
    },
  ];

  return {
    version: 1,
    lastUpdated: Date.now(),
    users,
    categories,
    products,
    stockMovements,
    orders,
    suppliers,
    purchases,
    activityLogs,
    settings,
    notifications,
    cashClosures,
  };
}

export function getDb(): DatabaseSchema {
  if (dbMemory) {
    if (dbMemory.settings?.nombreKiosco === 'Kiosco Escolar San Martín') {
      dbMemory.settings.nombreKiosco = 'kiosControl';
      dbMemory.settings.aliasMp = 'kioscontrol.mp';
      dbMemory.settings.qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https%3A%2F%2Fmpago.la%2Fpos%2Fkioscontrol';
      saveDb();
    }
    if (!dbMemory.notifications) {
      dbMemory.notifications = [];
      saveDb();
    }
    if (!dbMemory.cashClosures) {
      dbMemory.cashClosures = [];
      saveDb();
    }
    return dbMemory;
  }
  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbMemory = JSON.parse(content);
      if (dbMemory?.settings?.nombreKiosco === 'Kiosco Escolar San Martín') {
        dbMemory.settings.nombreKiosco = 'kiosControl';
        dbMemory.settings.aliasMp = 'kioscontrol.mp';
        dbMemory.settings.qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https%3A%2F%2Fmpago.la%2Fpos%2Fkioscontrol';
        saveDb();
      }
      if (dbMemory) {
        let changed = false;
        if (!dbMemory.notifications || dbMemory.notifications.length === 0) {
          dbMemory.notifications = getInitialSeedData().notifications;
          changed = true;
        }
        if (!dbMemory.cashClosures || dbMemory.cashClosures.length === 0) {
          dbMemory.cashClosures = getInitialSeedData().cashClosures;
          changed = true;
        }
        // Ensure users have tipoAlumno
        for (const u of dbMemory.users) {
          if (!u.tipoAlumno) {
            u.tipoAlumno = u.email === 'sofia@alumno.edu' ? 'colaborador' : 'digital';
            changed = true;
          }
        }
        if (changed) {
          saveDb();
        }
      }
      return dbMemory!;
    } catch (err) {
      console.error('Error reading db file, regenerating seed:', err);
    }
  }

  const seed = getInitialSeedData();
  dbMemory = seed;
  saveDb();
  return dbMemory;
}

export function saveDb(): void {
  if (!dbMemory) return;
  ensureDataDir();
  dbMemory.lastUpdated = Date.now();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(dbMemory, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Global update version to notify SSE clients
let updateCounter = 1;
export function bumpUpdateCounter() {
  updateCounter++;
}
export function getUpdateCounter() {
  return updateCounter;
}

// ----------------- Business Logic Helpers ----------------- //

export function addAuditLog(usuarioId: string, usuarioNombre: string, accion: string, elementoAfectado: string, detalle: string) {
  const db = getDb();
  const log: ActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    usuarioId,
    usuarioNombre,
    accion,
    elementoAfectado,
    detalle,
    fecha: new Date().toISOString(),
  };
  db.activityLogs.unshift(log);
  if (db.activityLogs.length > 500) {
    db.activityLogs.pop();
  }
  saveDb();
  bumpUpdateCounter();
}

export function recordStockMovement(
  productoId: string,
  tipo: 'entrada' | 'salida' | 'ajuste',
  cantidad: number,
  motivo: string,
  usuarioId: string,
  usuarioNombre: string
) {
  const db = getDb();
  const prod = db.products.find((p) => p.id === productoId);
  if (!prod) throw new Error('Producto no encontrado');

  const stockPrevio = prod.stock;
  let nuevoStock = stockPrevio;

  if (tipo === 'entrada') {
    nuevoStock = stockPrevio + cantidad;
  } else if (tipo === 'salida') {
    if (stockPrevio - cantidad < 0) {
      throw new Error(`Stock insuficiente. Quedan solo ${stockPrevio} unidades.`);
    }
    nuevoStock = stockPrevio - cantidad;
  } else {
    nuevoStock = cantidad; // Ajuste directo
  }

  if (nuevoStock < 0) {
    throw new Error('El stock no puede ser negativo');
  }

  prod.stock = nuevoStock;
  if (nuevoStock === 0) {
    prod.estado = 'agotado';
  } else if (nuevoStock <= prod.stockMinimo) {
    prod.estado = 'stock_bajo';
  } else {
    prod.estado = 'disponible';
  }
  prod.updatedAt = new Date().toISOString();

  const movement: StockMovement = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    productoId,
    productoNombre: prod.nombre,
    tipo,
    cantidad: tipo === 'salida' ? -cantidad : cantidad,
    stockPrevio,
    stockPosterior: nuevoStock,
    motivo,
    usuarioId,
    usuarioNombre,
    fecha: new Date().toISOString(),
  };

  db.stockMovements.unshift(movement);
  saveDb();
  bumpUpdateCounter();

  addAuditLog(
    usuarioId,
    usuarioNombre,
    `Movimiento de stock (${tipo})`,
    prod.nombre,
    `${motivo}: Stock de ${stockPrevio} a ${nuevoStock} (${tipo === 'salida' ? '-' : '+'}${cantidad})`
  );

  return { product: prod, movement };
}

export function placeClientOrder(
  clienteId: string,
  items: { productoId: string; cantidad: number }[],
  metodoPago: 'efectivo' | 'mercadopago' | 'transferencia',
  modalidadRetiro: 'inmediato' | 'recreo',
  recreoHora?: string,
  notas?: string
): Order {
  const db = getDb();
  const client = db.users.find((u) => u.id === clienteId);
  if (!client) throw new Error('Usuario no encontrado');
  if (client.isBlocked) throw new Error('Tu cuenta se encuentra bloqueada. Contactate con administración.');
  if (client.tipoAlumno === 'colaborador') {
    throw new Error('Tu cuenta está registrada en Modalidad Alumno Colaborador (compras directas en el mostrador físico del kiosco).');
  }

  if (!items || items.length === 0) {
    throw new Error('El carrito no puede estar vacío.');
  }

  // 1. Transactional stock check & build order items
  const orderItems = [];
  let total = 0;
  let costoTotal = 0;

  for (const item of items) {
    const prod = db.products.find((p) => p.id === item.productoId);
    if (!prod) {
      throw new Error(`El producto con ID ${item.productoId} ya no existe.`);
    }
    if (prod.estado === 'desactivado') {
      throw new Error(`El producto ${prod.nombre} no se encuentra disponible.`);
    }
    if (prod.stock < item.cantidad) {
      throw new Error(
        `⚠️ No hay suficientes unidades de ${prod.nombre}. Actualmente quedan ${prod.stock} unidades.`
      );
    }

    const precioVenta = prod.enPromocion && prod.precioPromocional ? prod.precioPromocional : prod.precioVenta;
    const subtotal = precioVenta * item.cantidad;
    const subcosto = prod.precioCompra * item.cantidad;

    total += subtotal;
    costoTotal += subcosto;

    orderItems.push({
      productoId: prod.id,
      productoNombre: prod.nombre,
      marca: prod.marca,
      cantidad: item.cantidad,
      precioUnitario: precioVenta,
      costoUnitario: prod.precioCompra,
      subtotal,
      imagen: prod.imagen,
    });
  }

  // 2. Deduct stock automatically and record stock movement
  for (const item of items) {
    const prod = db.products.find((p) => p.id === item.productoId)!;
    const stockPrevio = prod.stock;
    prod.stock -= item.cantidad;
    if (prod.stock === 0) {
      prod.estado = 'agotado';
    } else if (prod.stock <= prod.stockMinimo) {
      prod.estado = 'stock_bajo';
    }
    prod.updatedAt = new Date().toISOString();

    db.stockMovements.unshift({
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productoId: prod.id,
      productoNombre: prod.nombre,
      tipo: 'salida',
      cantidad: -item.cantidad,
      stockPrevio,
      stockPosterior: prod.stock,
      motivo: `Venta pedido web por ${client.nombreVisible}`,
      usuarioId: client.id,
      usuarioNombre: client.nombreVisible,
      fecha: new Date().toISOString(),
    });
  }

  const nextOrderNumber = (db.orders.length > 0 ? Math.max(...db.orders.map((o) => o.numeroPedido || 100)) : 100) + 1;
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const comprobanteId = `COMP-${nextOrderNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

  const order: Order = {
    id: orderId,
    numeroPedido: nextOrderNumber,
    clienteId: client.id,
    clienteNombre: `${client.nombre} ${client.apellido}`,
    clienteVisible: client.nombreVisible,
    clienteEmail: client.email,
    items: orderItems,
    total,
    costoTotal,
    gananciaEstimada: total - costoTotal,
    metodoPago,
    estadoPago: metodoPago === 'efectivo' ? 'pendiente' : 'confirmado',
    modalidadRetiro,
    recreoHora: modalidadRetiro === 'recreo' ? recreoHora || 'Primer Recreo' : undefined,
    estado: 'pendiente',
    fecha: new Date().toISOString(),
    comprobanteId,
    notas,
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(order);

  // Update client purchase stats
  client.totalSpent = (client.totalSpent || 0) + total;
  client.orderCount = (client.orderCount || 0) + 1;

  addNotification(
    `Nuevo pedido #${nextOrderNumber} recibido`,
    `${client.nombreVisible} realizó un pedido por $${total} (${orderItems.length} ítems). Retiro: ${modalidadRetiro === 'inmediato' ? 'Inmediato' : 'Recreo ' + (recreoHora || '')}`,
    'pedidos',
    { targetRole: 'admin', prioridad: 'alta', orderId, actionTab: 'orders' }
  );
  addNotification(
    `Pedido #${nextOrderNumber} recibido`,
    `Tu pedido por $${total} fue recibido y está a la espera de preparación.`,
    'pedidos',
    { targetRole: 'cliente', targetUserId: client.id, prioridad: 'normal', orderId, actionTab: 'orders' }
  );

  saveDb();
  bumpUpdateCounter();

  return order;
}

export function calculateFinanceStats(): FinanceStats {
  const db = getDb();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthStr = now.toISOString().slice(0, 7);

  let ventasHoy = 0;
  let gananciasHoy = 0;
  let ventasMes = 0;
  let gananciasMes = 0;
  let costosMes = 0;
  let pedidosPendientes = 0;

  const productSalesMap: Record<
    string,
    { id: string; nombre: string; cantidad: number; total: number; ganancia: number }
  > = {};
  const paymentMethodMap: Record<string, { cantidad: number; total: number }> = {
    efectivo: { cantidad: 0, total: 0 },
    mercadopago: { cantidad: 0, total: 0 },
    transferencia: { cantidad: 0, total: 0 },
  };
  const hourlyMap: Record<string, number> = {};
  for (let h = 7; h <= 17; h++) {
    const key = `${h < 10 ? '0' + h : h}:00`;
    hourlyMap[key] = 0;
  }

  // Daily map for last 7 days
  const dailyMap: Record<string, { total: number; ganancia: number }> = {};
  for (let d = 6; d >= 0; d--) {
    const dt = new Date(Date.now() - d * 24 * 3600 * 1000);
    const dStr = dt.toISOString().slice(0, 10);
    dailyMap[dStr] = { total: 0, ganancia: 0 };
  }

  for (const order of db.orders) {
    const orderDateStr = order.fecha.slice(0, 10);
    const orderMonthStr = order.fecha.slice(0, 7);

    if (order.estado === 'pendiente') {
      pedidosPendientes++;
    }

    // Accumulate metrics for active / completed orders
    if (orderDateStr === todayStr) {
      ventasHoy += order.total;
      gananciasHoy += order.gananciaEstimada;
    }

    if (orderMonthStr === currentMonthStr) {
      ventasMes += order.total;
      gananciasMes += order.gananciaEstimada;
      costosMes += order.costoTotal;
    }

    if (dailyMap[orderDateStr]) {
      dailyMap[orderDateStr].total += order.total;
      dailyMap[orderDateStr].ganancia += order.gananciaEstimada;
    }

    // Payment method
    if (paymentMethodMap[order.metodoPago]) {
      paymentMethodMap[order.metodoPago].cantidad++;
      paymentMethodMap[order.metodoPago].total += order.total;
    }

    // Hours
    const orderHour = new Date(order.fecha).getHours();
    const hourKey = `${orderHour < 10 ? '0' + orderHour : orderHour}:00`;
    if (hourlyMap[hourKey] !== undefined) {
      hourlyMap[hourKey]++;
    }

    // Item stats
    for (const item of order.items) {
      if (!productSalesMap[item.productoId]) {
        productSalesMap[item.productoId] = {
          id: item.productoId,
          nombre: item.productoNombre,
          cantidad: 0,
          total: 0,
          ganancia: 0,
        };
      }
      productSalesMap[item.productoId].cantidad += item.cantidad;
      productSalesMap[item.productoId].total += item.subtotal;
      productSalesMap[item.productoId].ganancia += item.subtotal - item.costoUnitario * item.cantidad;
    }
  }

  const ranking = Object.values(productSalesMap).sort((a, b) => b.cantidad - a.cantidad);
  const bestSeller = ranking.length > 0 ? ranking[0] : null;
  const bajoStockCount = db.products.filter(
    (p) => p.estado === 'stock_bajo' || p.stock <= p.stockMinimo
  ).length;

  // Total purchases to suppliers
  const totalPurchasesCost = db.purchases.reduce((acc, p) => acc + p.total, 0);
  const dineroDisponible = Math.max(0, ventasMes - costosMes);

  return {
    ventasHoy,
    gananciasHoy,
    ventasMes,
    gananciasMes,
    costosMes,
    pedidosPendientes,
    pedidosTotales: db.orders.length,
    productosBajoStock: bajoStockCount,
    productoMasVendido: bestSeller,
    dineroDisponible,
    ventasPorDia: Object.entries(dailyMap).map(([fecha, data]) => ({
      fecha,
      total: data.total,
      ganancia: data.ganancia,
    })),
    metodosPagoDistribucion: Object.entries(paymentMethodMap).map(([metodo, data]) => ({
      metodo:
        metodo === 'efectivo'
          ? 'Efectivo'
          : metodo === 'mercadopago'
          ? 'Mercado Pago'
          : 'Transferencia',
      cantidad: data.cantidad,
      total: data.total,
    })),
    rankingProductos: ranking,
    horariosVentas: Object.entries(hourlyMap).map(([hora, cantidad]) => ({ hora, cantidad })),
  };
}

// ----------------- Notification Business Logic ----------------- //

export function addNotification(
  titulo: string,
  mensaje: string,
  categoria: AppNotification['categoria'],
  options: {
    targetRole?: 'admin' | 'cliente' | 'all';
    targetUserId?: string;
    prioridad?: 'baja' | 'normal' | 'alta';
    orderId?: string;
    actionTab?: string;
  } = {}
): AppNotification {
  const db = getDb();
  if (!db.notifications) db.notifications = [];

  const notif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    titulo,
    mensaje,
    categoria,
    fecha: new Date().toISOString(),
    leida: false,
    targetRole: options.targetRole || 'all',
    targetUserId: options.targetUserId,
    prioridad: options.prioridad || 'normal',
    orderId: options.orderId,
    actionTab: options.actionTab,
  };

  db.notifications.unshift(notif);
  if (db.notifications.length > 200) {
    db.notifications.pop();
  }
  saveDb();
  bumpUpdateCounter();
  return notif;
}

export function getNotificationsForUser(user: User | null): AppNotification[] {
  const db = getDb();
  if (!db.notifications) return [];

  if (!user) {
    return db.notifications.filter((n) => n.targetRole === 'all');
  }

  if (user.role === 'admin') {
    return db.notifications.filter(
      (n) => n.targetRole === 'admin' || n.targetRole === 'all'
    );
  }

  return db.notifications.filter(
    (n) =>
      n.targetRole === 'all' ||
      (n.targetRole === 'cliente' && (!n.targetUserId || n.targetUserId === user.id))
  );
}

export function markNotificationRead(id: string): boolean {
  const db = getDb();
  if (!db.notifications) return false;
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.leida = true;
    saveDb();
    bumpUpdateCounter();
    return true;
  }
  return false;
}

export function markAllNotificationsRead(user: User | null): boolean {
  const db = getDb();
  if (!db.notifications) return false;

  for (const n of db.notifications) {
    if (!user) {
      if (n.targetRole === 'all') n.leida = true;
    } else if (user.role === 'admin') {
      if (n.targetRole === 'admin' || n.targetRole === 'all') n.leida = true;
    } else {
      if (
        n.targetRole === 'all' ||
        (n.targetRole === 'cliente' && (!n.targetUserId || n.targetUserId === user.id))
      ) {
        n.leida = true;
      }
    }
  }
  saveDb();
  bumpUpdateCounter();
  return true;
}

// ----------------- Cash Register (Cierre de Caja) Business Logic ----------------- //

export function getCurrentCashStatus(targetDateStr?: string) {
  const db = getDb();
  const dateStr = targetDateStr || new Date().toISOString().slice(0, 10);

  if (!db.cashClosures) db.cashClosures = [];

  const existing = db.cashClosures.find((c) => c.fecha === dateStr);

  let ventasTotales = 0;
  let ventasEfectivo = 0;
  let ventasTransferencia = 0;
  let ventasOtros = 0;

  for (const order of db.orders) {
    if (order.fecha.slice(0, 10) === dateStr && order.estado !== 'cancelado') {
      ventasTotales += order.total;
      if (order.metodoPago === 'efectivo') {
        ventasEfectivo += order.total;
      } else if (order.metodoPago === 'mercadopago' || order.metodoPago === 'transferencia') {
        ventasTransferencia += order.total;
      } else {
        ventasOtros += order.total;
      }
    }
  }

  // Purchases / Expenses of the day
  let gastosTotales = 0;
  for (const p of db.purchases) {
    if (p.fecha.slice(0, 10) === dateStr) {
      gastosTotales += p.total;
    }
  }

  const resultadoEsperado = ventasEfectivo - gastosTotales;

  return {
    fecha: dateStr,
    isOpen: !existing || existing.estado === 'abierta',
    existingClosure: existing || null,
    summary: {
      ventasTotales,
      ventasEfectivo,
      ventasTransferencia,
      ventasOtros,
      gastosTotales,
      resultadoEsperado,
    },
  };
}

export function closeCashRegister(params: {
  fecha: string;
  dineroContado: number;
  observaciones?: string;
  responsableId: string;
  responsableNombre: string;
}): CashRegisterClosure {
  const db = getDb();
  if (!db.cashClosures) db.cashClosures = [];

  const { fecha, dineroContado, observaciones, responsableId, responsableNombre } = params;
  const status = getCurrentCashStatus(fecha);
  const { summary } = status;

  const diferencia = Number(dineroContado) - summary.resultadoEsperado;
  const now = new Date().toISOString();
  const horaCierre = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const closure: CashRegisterClosure = {
    id: `close_${fecha}`,
    fecha,
    horaApertura: '07:30',
    horaCierre,
    responsableId,
    responsableNombre,
    ventasTotales: summary.ventasTotales,
    ventasEfectivo: summary.ventasEfectivo,
    ventasTransferencia: summary.ventasTransferencia,
    ventasOtros: summary.ventasOtros,
    gastosTotales: summary.gastosTotales,
    resultadoEsperado: summary.resultadoEsperado,
    dineroContado: Number(dineroContado),
    diferencia,
    estado: 'cerrada',
    observaciones: observaciones || (diferencia === 0 ? 'Cierre balanceado exacto.' : diferencia > 0 ? `Sobrante de $${diferencia}` : `Faltante de $${Math.abs(diferencia)}`),
    cerradoEn: now,
  };

  const existingIdx = db.cashClosures.findIndex((c) => c.fecha === fecha);
  if (existingIdx >= 0) {
    db.cashClosures[existingIdx] = closure;
  } else {
    db.cashClosures.unshift(closure);
  }

  saveDb();
  bumpUpdateCounter();

  addAuditLog(
    responsableId,
    responsableNombre,
    'Cierre formal de caja diaria',
    `Caja ${fecha}`,
    `Ventas: $${summary.ventasTotales}, Efectivo contado: $${dineroContado}, Diferencia: ${diferencia >= 0 ? '+' : ''}$${diferencia}`
  );

  addNotification(
    `Caja diaria del ${fecha} cerrada`,
    `El responsable ${responsableNombre} cerró la caja. Resultado esperado: $${summary.resultadoEsperado}, Contado: $${dineroContado} (${diferencia === 0 ? 'Balanceada' : diferencia > 0 ? 'Sobrante +' + diferencia : 'Faltante ' + diferencia}).`,
    'caja',
    { targetRole: 'admin', prioridad: 'normal', actionTab: 'cash' }
  );

  return closure;
}

export function reopenCashRegister(fecha: string, adminUser: { id: string; nombreVisible: string }) {
  const db = getDb();
  if (!db.cashClosures) return null;
  const existing = db.cashClosures.find((c) => c.fecha === fecha);
  if (existing) {
    existing.estado = 'abierta';
    saveDb();
    bumpUpdateCounter();

    addAuditLog(
      adminUser.id,
      adminUser.nombreVisible,
      'Reapertura de caja diaria',
      `Caja ${fecha}`,
      'Se reabrió la caja para modificaciones o correcciones de la jornada.'
    );
    return existing;
  }
  return null;
}

// ----------------- Bulk Excel / CSV Product Import ----------------- //

export interface ParsedProductRow {
  rowNumber: number;
  nombre: string;
  marca: string;
  categoria: string;
  descripcion: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  sku: string;
  estado: string;
}

export interface BulkValidationResult {
  validRows: ParsedProductRow[];
  errors: { row: number; field: string; message: string; data?: any }[];
  summary: {
    totalRows: number;
    validCount: number;
    errorCount: number;
  };
}

export function validateBulkProducts(rawRows: any[]): BulkValidationResult {
  const db = getDb();
  const existingSkus = new Set(db.products.map((p) => (p.sku || '').toUpperCase().trim()));
  const batchSkus = new Set<string>();

  const validRows: ParsedProductRow[] = [];
  const errors: { row: number; field: string; message: string; data?: any }[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // considering header is row 1
    const nombre = (row.Nombre || row.nombre || '').toString().trim();
    const marca = (row.Marca || row.marca || 'Genérica').toString().trim();
    const categoria = (row.Categoria || row.categoria || row.Categoría || 'General').toString().trim();
    const descripcion = (row.Descripcion || row.descripcion || row.Descripción || '').toString().trim();
    const precioCompraRaw = row.PrecioCompra ?? row.precioCompra ?? row['Precio de compra'] ?? row.costo ?? 0;
    const precioVentaRaw = row.PrecioVenta ?? row.precioVenta ?? row['Precio de venta'] ?? 0;
    const stockRaw = row.Stock ?? row.stock ?? 0;
    const skuRaw = (row.SKU || row.sku || '').toString().trim();
    const estadoRaw = (row.Estado || row.estado || 'activo').toString().trim().toLowerCase();

    // 1. Check Name
    if (!nombre) {
      errors.push({ row: rowNum, field: 'Nombre', message: 'Producto sin nombre especificado.', data: row });
      return;
    }

    // 2. Check Prices
    const precioVenta = Number(precioVentaRaw);
    if (isNaN(precioVenta) || precioVenta <= 0) {
      errors.push({
        row: rowNum,
        field: 'Precio de venta',
        message: `Precio de venta inválido ($${precioVentaRaw}). Debe ser un número mayor a 0.`,
        data: row,
      });
      return;
    }

    const precioCompra = Number(precioCompraRaw);
    if (isNaN(precioCompra) || precioCompra < 0) {
      errors.push({
        row: rowNum,
        field: 'Precio de compra',
        message: `Precio de compra inválido ($${precioCompraRaw}). Debe ser 0 o superior.`,
        data: row,
      });
      return;
    }

    // 3. Check Stock
    const stock = Number(stockRaw);
    if (isNaN(stock) || stock < 0) {
      errors.push({
        row: rowNum,
        field: 'Stock',
        message: `Stock negativo o no numérico (${stockRaw}). El stock inicial no puede ser negativo.`,
        data: row,
      });
      return;
    }

    // 4. Check SKU
    let finalSku = skuRaw;
    if (!finalSku) {
      finalSku = `PROD-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
    } else {
      const upperSku = finalSku.toUpperCase();
      if (batchSkus.has(upperSku)) {
        errors.push({
          row: rowNum,
          field: 'SKU',
          message: `SKU duplicado en el mismo archivo ("${skuRaw}").`,
          data: row,
        });
        return;
      }
      batchSkus.add(upperSku);
    }

    validRows.push({
      rowNumber: rowNum,
      nombre,
      marca,
      categoria,
      descripcion,
      precioCompra,
      precioVenta,
      stock,
      sku: finalSku,
      estado: estadoRaw === 'desactivado' || estadoRaw === 'agotado' ? estadoRaw : 'activo',
    });
  });

  return {
    validRows,
    errors,
    summary: {
      totalRows: rawRows.length,
      validCount: validRows.length,
      errorCount: errors.length,
    },
  };
}

export function commitBulkImportProducts(
  validRows: ParsedProductRow[],
  adminUser: { id: string; nombreVisible: string }
): Product[] {
  const db = getDb();
  const now = new Date().toISOString();
  const addedProducts: Product[] = [];

  for (const item of validRows) {
    // Check or find category
    let cat = db.categories.find(
      (c) => c.nombre.toLowerCase().trim() === item.categoria.toLowerCase().trim()
    );
    if (!cat) {
      const catId = item.categoria.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15) || 'general';
      cat = {
        id: catId,
        nombre: item.categoria,
        icono: 'Package',
        activa: true,
        orden: db.categories.length + 1,
      };
      db.categories.push(cat);
    }

    // Check if product with same SKU already exists to update or insert
    const existing = db.products.find(
      (p) => p.sku && p.sku.toUpperCase().trim() === item.sku.toUpperCase().trim()
    );

    if (existing) {
      const oldStock = existing.stock;
      existing.nombre = item.nombre;
      existing.marca = item.marca;
      existing.descripcion = item.descripcion || existing.descripcion;
      existing.precioCompra = item.precioCompra;
      existing.precioVenta = item.precioVenta;
      existing.stock = item.stock;
      existing.estado = item.stock <= 0 ? 'agotado' : 'disponible';
      existing.updatedAt = now;
      addedProducts.push(existing);

      db.stockMovements.unshift({
        id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productoId: existing.id,
        productoNombre: existing.nombre,
        tipo: 'ajuste',
        cantidad: item.stock - oldStock,
        stockPrevio: oldStock,
        stockPosterior: item.stock,
        motivo: 'Actualización masiva Excel',
        usuarioId: adminUser.id,
        usuarioNombre: adminUser.nombreVisible,
        fecha: now,
      });
    } else {
      const newProduct: Product = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        nombre: item.nombre,
        marca: item.marca,
        categoriaId: cat.id,
        descripcion: item.descripcion || `Producto ${item.nombre} disponible en kiosControl`,
        imagen:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
        precioCompra: item.precioCompra,
        precioVenta: item.precioVenta,
        stock: item.stock,
        stockMinimo: 5,
        sku: item.sku,
        estado: item.stock <= 0 ? 'agotado' : 'disponible',
        destacado: false,
        enPromocion: false,
        createdAt: now,
        updatedAt: now,
      };

      db.products.unshift(newProduct);
      addedProducts.push(newProduct);

      db.stockMovements.unshift({
        id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productoId: newProduct.id,
        productoNombre: newProduct.nombre,
        tipo: 'entrada',
        cantidad: item.stock,
        stockPrevio: 0,
        stockPosterior: item.stock,
        motivo: 'Carga masiva inicial Excel',
        usuarioId: adminUser.id,
        usuarioNombre: adminUser.nombreVisible,
        fecha: now,
      });
    }
  }

  saveDb();
  bumpUpdateCounter();

  addAuditLog(
    adminUser.id,
    adminUser.nombreVisible,
    'Importación masiva Excel',
    `${addedProducts.length} productos`,
    `Se incorporaron/actualizaron ${addedProducts.length} productos con sus respectivos movimientos de stock.`
  );

  addNotification(
    'Carga masiva completada',
    `Se importaron exitosamente ${addedProducts.length} productos al catálogo escolar mediante Excel.`,
    'excel',
    { targetRole: 'admin', prioridad: 'normal', actionTab: 'products' }
  );

  return addedProducts;
}

