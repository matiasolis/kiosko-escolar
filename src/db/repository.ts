import { eq, desc, asc, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  categories,
  products,
  orders,
  stockMovements,
  suppliers,
  purchases,
  activityLogs,
  kioskSettings,
} from './schema.ts';
import { User, Product, Category, Order, Supplier, StockMovement, ActivityLog, KioskSettings } from '../types.ts';
import bcrypt from 'bcryptjs';

// -------------------------------------------------------------
// SEED INITIAL DATABASE IF EMPTY
// -------------------------------------------------------------
export async function seedDatabaseIfEmpty() {
  try {
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) {
      return; // Already initialized
    }

    console.log('Seeding Cloud SQL PostgreSQL database with school kiosk data...');

    // 1. Initial Settings
    const defaultRecreos = [
      { id: 'rec_1', nombre: '1° Recreo Matutino', horaInicio: '09:30', horaFin: '09:45', activo: true },
      { id: 'rec_2', nombre: '2° Recreo Matutino', horaInicio: '11:15', horaFin: '11:30', activo: true },
      { id: 'rec_almuerzo', nombre: 'Almuerzo Escolar', horaInicio: '12:45', horaFin: '13:45', activo: true },
      { id: 'rec_tarde', nombre: 'Recreo de la Tarde', horaInicio: '15:30', horaFin: '15:45', activo: true },
    ];

    await db.insert(kioskSettings).values({
      id: 'global',
      nombreKiosco: 'kiosControl',
      abierto: true,
      horaApertura: '07:30',
      horaCierre: '18:00',
      mensajeCierre: 'El kiosco se encuentra cerrado temporalmente. Abrimos mañana a las 07:30.',
      aliasMp: 'kioscontrol.mp',
      titularMp: 'Asociación Cooperadora Escolar',
      cbuMp: '0000003100012345678901',
      recreos: defaultRecreos,
    }).onConflictDoNothing();

    // 2. Categories
    const seedCategories = [
      { id: 'bebidas', nombre: 'Bebidas', icono: 'CupSoda', activa: true, orden: 1 },
      { id: 'alfajores', nombre: 'Alfajores', icono: 'Cookie', activa: true, orden: 2 },
      { id: 'golosinas', nombre: 'Golosinas', icono: 'Candy', activa: true, orden: 3 },
      { id: 'snacks', nombre: 'Snacks', icono: 'Popcorn', activa: true, orden: 4 },
      { id: 'comida', nombre: 'Comida Caliente & Sándwiches', icono: 'Sandwich', activa: true, orden: 5 },
      { id: 'saludable', nombre: 'Opciones Saludables', icono: 'Apple', activa: true, orden: 6 },
    ];
    for (const c of seedCategories) {
      await db.insert(categories).values(c).onConflictDoNothing();
    }

    // 3. Suppliers
    const seedSuppliers = [
      {
        id: 'sup_arcor',
        nombre: 'Distribuidora Arcor Central',
        contacto: 'Carlos Méndez',
        telefono: '11-4567-8901',
        email: 'ventas@arcor-distribucion.com.ar',
        rubro: 'Golosinas y Galletitas',
        diasEntrega: 'Lunes y Jueves (08:00)',
      },
      {
        id: 'sup_coca',
        nombre: 'Coca-Cola Andina Distribuidora',
        contacto: 'Martín Suarez',
        telefono: '11-3421-9876',
        email: 'pedidos@andina.com.ar',
        rubro: 'Bebidas y Aguas',
        diasEntrega: 'Martes y Viernes (09:00)',
      },
      {
        id: 'sup_panaderia',
        nombre: 'Panificadora La Central Escolar',
        contacto: 'Doña Rosa',
        telefono: '11-9876-5432',
        email: 'rosa@panaderiaescolar.com',
        rubro: 'Panadería y Sándwiches Frescos',
        diasEntrega: 'Todos los días escolares (07:00)',
      },
    ];
    for (const s of seedSuppliers) {
      await db.insert(suppliers).values(s).onConflictDoNothing();
    }

    // 4. Products
    const seedProducts = [
      {
        id: 'prod_coca',
        nombre: 'Coca-Cola 500ml',
        marca: 'Coca-Cola',
        categoriaId: 'bebidas',
        descripcion: 'Gaseosa refrescante sabor original 500ml en botella plástica.',
        imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        precioCompra: 900,
        precioVenta: 1600,
        stock: 35,
        stockMinimo: 10,
        sku: 'BEB-COC-500',
        estado: 'disponible',
        destacado: true,
        enPromocion: false,
        proveedorId: 'sup_coca',
      },
      {
        id: 'prod_agua',
        nombre: 'Agua Mineral Sin Gas 600ml',
        marca: 'Villavicencio',
        categoriaId: 'bebidas',
        descripcion: 'Agua pura mineral de manantial natural, botella con tapa deportiva.',
        imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
        precioCompra: 500,
        precioVenta: 900,
        stock: 48,
        stockMinimo: 15,
        sku: 'BEB-AGU-600',
        estado: 'disponible',
        destacado: false,
        enPromocion: false,
        proveedorId: 'sup_coca',
      },
      {
        id: 'prod_alfajor_havanna',
        nombre: 'Alfajor Havanna 70% Cacao',
        marca: 'Havanna',
        categoriaId: 'alfajores',
        descripcion: 'Alfajor premium relleno con abundante dulce de leche y cobertura de chocolate puro.',
        imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
        precioCompra: 1200,
        precioVenta: 2000,
        stock: 22,
        stockMinimo: 8,
        sku: 'ALF-HAV-70',
        estado: 'disponible',
        destacado: true,
        enPromocion: true,
        precioPromocional: 1800,
        proveedorId: 'sup_arcor',
      },
      {
        id: 'prod_alfajor_guaymallen',
        nombre: 'Alfajor Guaymallén Triple Blanco',
        marca: 'Guaymallén',
        categoriaId: 'alfajores',
        descripcion: 'Alfajor escolar tradicional triple con dulce de leche y baño de repostería blanco.',
        imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
        precioCompra: 320,
        precioVenta: 600,
        stock: 60,
        stockMinimo: 20,
        sku: 'ALF-GUAY-TRI',
        estado: 'disponible',
        destacado: false,
        enPromocion: false,
        proveedorId: 'sup_arcor',
      },
      {
        id: 'prod_papas_lays',
        nombre: 'Papas Fritas Clásicas 85g',
        marca: 'Lay\'s',
        categoriaId: 'snacks',
        descripcion: 'Papas fritas crujientes con toque de sal marina.',
        imagen: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
        precioCompra: 850,
        precioVenta: 1500,
        stock: 25,
        stockMinimo: 10,
        sku: 'SNK-LAY-85',
        estado: 'disponible',
        destacado: true,
        enPromocion: false,
        proveedorId: 'sup_arcor',
      },
      {
        id: 'prod_tostado',
        nombre: 'Tostado de Jamón y Queso Caliente',
        marca: 'Kiosco Elaboración',
        categoriaId: 'comida',
        descripcion: 'Sándwich tostado en pan de miga con jamón cocido seleccionado y queso derretido.',
        imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
        precioCompra: 1200,
        precioVenta: 2200,
        stock: 14,
        stockMinimo: 5,
        sku: 'COM-TOST-JQ',
        estado: 'disponible',
        destacado: true,
        enPromocion: false,
        proveedorId: 'sup_panaderia',
      },
      {
        id: 'prod_empanada',
        nombre: 'Empanada de Carne al Horno',
        marca: 'Kiosco Elaboración',
        categoriaId: 'comida',
        descripcion: 'Empanada criolla horneada rellena de carne suave picada y cebollas.',
        imagen: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        precioCompra: 700,
        precioVenta: 1300,
        stock: 4,
        stockMinimo: 8,
        sku: 'COM-EMP-CARNE',
        estado: 'stock_bajo',
        destacado: false,
        enPromocion: false,
        proveedorId: 'sup_panaderia',
      },
      {
        id: 'prod_barrita',
        nombre: 'Barra de Cereal Frutilla & Yogur',
        marca: 'Cereal Mix',
        categoriaId: 'saludable',
        descripcion: 'Barra nutritiva rica en fibras y cereales integrales con baño de yogur.',
        imagen: 'https://images.unsplash.com/photo-1622484212850-cab3c23326f5?w=600&auto=format&fit=crop&q=80',
        precioCompra: 350,
        precioVenta: 700,
        stock: 30,
        stockMinimo: 10,
        sku: 'SAL-BAR-FRU',
        estado: 'disponible',
        destacado: false,
        enPromocion: false,
        proveedorId: 'sup_arcor',
      },
      {
        id: 'prod_gomitas_mogul',
        nombre: 'Gomitas Mogul Dientes y Frutas',
        marca: 'Mogul',
        categoriaId: 'golosinas',
        descripcion: 'Caramelos masticables de gelatina con jugo natural de frutas.',
        imagen: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80',
        precioCompra: 400,
        precioVenta: 800,
        stock: 0,
        stockMinimo: 15,
        sku: 'GOL-MOG-FRU',
        estado: 'agotado',
        destacado: false,
        enPromocion: false,
        proveedorId: 'sup_arcor',
      }
    ];

    for (const p of seedProducts) {
      await db.insert(products).values(p).onConflictDoNothing();
    }

    // 5. Initial Users
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);
    const alumnoPasswordHash = bcrypt.hashSync('alumno123', salt);

    await db.insert(users).values([
      {
        uid: 'usr_admin_1',
        email: 'admin@kiosco.edu',
        passwordHash: adminPasswordHash,
        role: 'admin',
        nombre: 'Prof. Roberto',
        apellido: 'Gómez',
        nombreVisible: 'Roberto',
        isBlocked: false,
        totalSpent: 0,
        orderCount: 0,
        favorites: [],
      },
      {
        uid: 'usr_alumno_1',
        email: 'matias@alumno.edu',
        passwordHash: alumnoPasswordHash,
        role: 'cliente',
        nombre: 'Matías',
        apellido: 'Olís',
        nombreVisible: 'Matias',
        isBlocked: false,
        totalSpent: 4200,
        orderCount: 2,
        favorites: ['prod_coca', 'prod_alfajor_havanna'],
      }
    ]).onConflictDoNothing();

    // 6. Seed sample order
    await db.insert(orders).values({
      id: 'ord_sample_1',
      numeroPedido: 'ORD-1001',
      usuarioId: 'usr_alumno_1',
      usuarioNombre: 'Matías Olís',
      usuarioEmail: 'matias@alumno.edu',
      items: [
        {
          producto: {
            id: 'prod_tostado',
            nombre: 'Tostado de Jamón y Queso Caliente',
            marca: 'Kiosco',
            categoriaId: 'comida',
            descripcion: '',
            imagen: '',
            precioCompra: 1200,
            precioVenta: 2200,
            stock: 14,
            stockMinimo: 5,
            sku: 'COM-TOST-JQ',
            estado: 'disponible',
            destacado: true,
            enPromocion: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          cantidad: 1,
          subtotal: 2200,
        },
        {
          producto: {
            id: 'prod_coca',
            nombre: 'Coca-Cola 500ml',
            marca: 'Coca-Cola',
            categoriaId: 'bebidas',
            descripcion: '',
            imagen: '',
            precioCompra: 900,
            precioVenta: 1600,
            stock: 35,
            stockMinimo: 10,
            sku: 'BEB-COC-500',
            estado: 'disponible',
            destacado: true,
            enPromocion: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          cantidad: 1,
          subtotal: 1600,
        }
      ],
      total: 3800,
      totalCosto: 2100,
      gananciaNeta: 1700,
      metodoPago: 'mercadopago',
      estado: 'pendiente',
      comprobantePago: 'MP-TRANS-7891234',
      recreoDestino: '1° Recreo Matutino (09:30)',
      notas: 'Bien caliente por favor',
    }).onConflictDoNothing();

    console.log('Database successfully seeded with school kiosk records.');
  } catch (error) {
    console.error('Error during database seed:', error);
  }
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getDbUsers() {
  try {
    return await db.select().from(users).orderBy(asc(users.id));
  } catch (err) {
    console.error('getDbUsers failed:', err);
    throw new Error('Error al obtener usuarios de la base de datos', { cause: err });
  }
}

export async function getDbUserByEmail(email: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    return result[0] || null;
  } catch (err) {
    console.error('getDbUserByEmail failed:', err);
    throw new Error('Error al buscar usuario', { cause: err });
  }
}

export async function getDbUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (err) {
    console.error('getDbUserByUid failed:', err);
    throw new Error('Error al buscar usuario por UID', { cause: err });
  }
}

export async function createDbUser(userData: {
  uid: string;
  email: string;
  passwordHash?: string;
  role: 'admin' | 'cliente';
  nombre: string;
  apellido: string;
  nombreVisible: string;
}) {
  try {
    const result = await db.insert(users).values({
      uid: userData.uid,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash || null,
      role: userData.role,
      nombre: userData.nombre,
      apellido: userData.apellido,
      nombreVisible: userData.nombreVisible,
      isBlocked: false,
      totalSpent: 0,
      orderCount: 0,
      favorites: [],
    }).returning();
    return result[0];
  } catch (err) {
    console.error('createDbUser failed:', err);
    throw new Error('Error al crear usuario en la base de datos', { cause: err });
  }
}

// -------------------------------------------------------------
// PRODUCT OPERATIONS
// -------------------------------------------------------------
export async function getDbProducts() {
  try {
    return await db.select().from(products).orderBy(desc(products.destacado), asc(products.nombre));
  } catch (err) {
    console.error('getDbProducts failed:', err);
    throw new Error('Error al obtener productos', { cause: err });
  }
}

export async function getDbCategories() {
  try {
    return await db.select().from(categories).orderBy(asc(categories.orden));
  } catch (err) {
    console.error('getDbCategories failed:', err);
    throw new Error('Error al obtener categorías', { cause: err });
  }
}

// -------------------------------------------------------------
// ORDER OPERATIONS
// -------------------------------------------------------------
export async function getDbOrders() {
  try {
    return await db.select().from(orders).orderBy(desc(orders.fecha));
  } catch (err) {
    console.error('getDbOrders failed:', err);
    throw new Error('Error al obtener pedidos', { cause: err });
  }
}

// -------------------------------------------------------------
// SETTINGS OPERATIONS
// -------------------------------------------------------------
export async function getDbSettings() {
  try {
    const res = await db.select().from(kioskSettings).where(eq(kioskSettings.id, 'global')).limit(1);
    return res[0] || null;
  } catch (err) {
    console.error('getDbSettings failed:', err);
    throw new Error('Error al obtener configuración', { cause: err });
  }
}

// -------------------------------------------------------------
// SUPPLIERS & PURCHASES
// -------------------------------------------------------------
export async function getDbSuppliers() {
  try {
    return await db.select().from(suppliers).orderBy(asc(suppliers.nombre));
  } catch (err) {
    console.error('getDbSuppliers failed:', err);
    throw new Error('Error al obtener proveedores', { cause: err });
  }
}

export async function getDbPurchases() {
  try {
    return await db.select().from(purchases).orderBy(desc(purchases.fecha));
  } catch (err) {
    console.error('getDbPurchases failed:', err);
    throw new Error('Error al obtener compras', { cause: err });
  }
}

// -------------------------------------------------------------
// STOCK MOVEMENTS & LOGS
// -------------------------------------------------------------
export async function getDbStockMovements() {
  try {
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.fecha)).limit(100);
  } catch (err) {
    console.error('getDbStockMovements failed:', err);
    throw new Error('Error al obtener movimientos de stock', { cause: err });
  }
}

export async function getDbActivityLogs() {
  try {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.fecha)).limit(100);
  } catch (err) {
    console.error('getDbActivityLogs failed:', err);
    throw new Error('Error al obtener registro de actividad', { cause: err });
  }
}
