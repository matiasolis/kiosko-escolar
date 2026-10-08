import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  Product,
  Category,
  Order,
  CartItem,
  KioskSettings,
  Supplier,
  AppNotification,
} from '../types';
import { playChime } from '../utils/formatters';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { authService } from '../api/services/auth.service';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'stock'
  | 'cash'
  | 'finances'
  | 'clients'
  | 'notifications'
  | 'statistics'
  | 'suppliers'
  | 'purchases'
  | 'activity'
  | 'settings';

export type ShopTab = 'catalog' | 'orders' | 'favorites' | 'profile';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: User | null;
  token: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userExperience: 'admin' | 'shop';
  setUserExperience: (exp: 'admin' | 'shop') => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeShopTab: ShopTab;
  setActiveShopTab: (tab: ShopTab) => void;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  orders: Order[];
  settings: KioskSettings | null;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  privacyModalOpen: boolean;
  setPrivacyModalOpen: (open: boolean) => void;
  excelImportModalOpen: boolean;
  setExcelImportModalOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  repeatOrder: (order: Order) => void;
  activeVoucherOrder: Order | null;
  setActiveVoucherOrder: (order: Order | null) => void;
  lastOrderPlaced: Order | null;
  setLastOrderPlaced: (order: Order | null) => void;
  pendingOrdersCount: number;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: { nombre: string; apellido: string; nombreVisible: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme initialization (detect system or local preference)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kiosco_theme') as 'light' | 'dark';
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kiosco_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Auth State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kiosco_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kiosco_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Views & Tabs
  const [userExperience, setUserExperience] = useState<'admin' | 'shop'>('shop');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [activeShopTab, setActiveShopTab] = useState<ShopTab>('catalog');

  // Modals & Drawers
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [excelImportModalOpen, setExcelImportModalOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [activeVoucherOrder, setActiveVoucherOrder] = useState<Order | null>(null);
  const [lastOrderPlaced, setLastOrderPlaced] = useState<Order | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kiosco_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kiosco_cart', JSON.stringify(cart));
  }, [cart]);

  // Data Store
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<KioskSettings | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Notifications API handlers
  const fetchNotifications = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadNotificationsCount(data.unreadCount || 0);
        }
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, [token]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking notification read', e);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/notifications/read-all', { method: 'POST', headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadNotificationsCount(0);
    } catch (e) {
      console.error('Error marking all notifications read', e);
    }
  }, [token]);

  // Fetch initial core data
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?includeDeactivated=true');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error('Error fetching products', e);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error('Error fetching categories', e);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (e) {
      console.error('Error fetching settings', e);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.suppliers) setSuppliers(data.suppliers);
    } catch (e) {
      console.error('Error fetching suppliers', e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
          const pending = data.orders.filter((o: Order) => o.estado === 'pendiente').length;
          setPendingOrdersCount(pending);
        }
      }
    } catch (e) {
      console.error('Error fetching orders', e);
    }
  }, [token]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchSuppliers(),
      fetchSettings(),
      fetchOrders(),
      fetchNotifications(),
    ]);
  }, [fetchProducts, fetchCategories, fetchSuppliers, fetchSettings, fetchOrders, fetchNotifications]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Adjust experience when user logs in or role changes
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setUserExperience('admin');
    } else {
      setUserExperience('shop');
    }
  }, [currentUser?.role]);

  // Real-time synchronization polling (every 3 seconds)
  const [lastVersion, setLastVersion] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/events/version');
        if (!res.ok) return;
        const data = await res.json();

        if (data.version && data.version !== lastVersion) {
          setLastVersion(data.version);

          // Check if new pending order arrived for admin
          if (currentUser?.role === 'admin' && data.pendingOrdersCount > pendingOrdersCount) {
            playChime('order');
            addToast('info', '🔔 ¡Nuevo Pedido Recibido!', `Hay ${data.pendingOrdersCount} pedidos pendientes para preparar.`);
          }

          setPendingOrdersCount(data.pendingOrdersCount);
          fetchProducts();
          fetchOrders();
        }
      } catch (err) {
        // network silent
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastVersion, pendingOrdersCount, currentUser, addToast, fetchProducts, fetchOrders]);

  // Login
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const data = await authService.login({ email, password: pass });

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('kiosco_token', data.token);
      localStorage.setItem('kiosco_user', JSON.stringify(data.user));

      addToast('success', `¡Bienvenido/a ${data.user.nombreVisible}!`, data.user.role === 'admin' ? 'Panel de Administración habilitado.' : 'Tu sesión de compras está activa.');
      setAuthModalOpen(false);

      if (data.user.role === 'admin') {
        setUserExperience('admin');
      } else {
        setUserExperience('shop');
      }

      refreshAllData();
      return true;
    } catch (e: any) {
      addToast('error', 'Error al iniciar sesión', e.message);
      return false;
    }
  };

  // Google Firebase Sign-In
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', 'Error de autenticación Google', data.error);
        return false;
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('kiosco_token', data.token);
      localStorage.setItem('kiosco_user', JSON.stringify(data.user));

      addToast(
        'success',
        `¡Bienvenido/a ${data.user.nombreVisible}!`,
        data.user.role === 'admin'
          ? 'Panel de Administración escolar habilitado.'
          : 'Tu cuenta escolar de Google está activa.'
      );
      setAuthModalOpen(false);

      if (data.user.role === 'admin') {
        setUserExperience('admin');
      } else {
        setUserExperience('shop');
      }

      refreshAllData();
      return true;
    } catch (e: any) {
      console.error('Google login error:', e);
      addToast('error', 'Error con Google Sign-In', e.message || 'No se pudo iniciar sesión.');
      return false;
    }
  };

  // Register
  const register = async (formData: {
    nombre: string;
    apellido: string;
    nombreVisible: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      const data = await authService.register(formData);

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('kiosco_token', data.token);
      localStorage.setItem('kiosco_user', JSON.stringify(data.user));

      addToast('success', `¡Cuenta creada exitosamente!`, `Bienvenido/a a Kios Mercado, ${data.user.nombreVisible}.`);
      setAuthModalOpen(false);
      setUserExperience('shop');

      refreshAllData();
      return true;
    } catch (e: any) {
      addToast('error', 'Error en el registro', e.message);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('kiosco_token');
    localStorage.removeItem('kiosco_user');
    setUserExperience('shop');
    setActiveShopTab('catalog');
    addToast('info', 'Sesión cerrada', 'Has salido de tu cuenta de forma segura.');
  };

  // Cart operations with live stock checks
  const addToCart = (product: Product, quantity = 1) => {
    // Check if user is an "Alumno colaborador"
    if (currentUser?.tipoAlumno === 'colaborador') {
      addToast(
        'info',
        'Modalidad Alumno Colaborador',
        'Tu cuenta está en modalidad presencial. Podés consultar los productos para comprar directamente en el mostrador del kiosco.'
      );
      return;
    }

    if (product.estado === 'desactivado' || product.estado === 'agotado' || product.stock <= 0) {
      addToast('warning', 'Producto no disponible', `${product.nombre} se encuentra agotado.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const targetQty = currentQty + quantity;

      if (targetQty > product.stock) {
        addToast(
          'warning',
          'Stock insuficiente',
          `No podés agregar más de ${product.stock} unidades de ${product.nombre}.`
        );
        return prev;
      }

      playChime('success');
      addToast('success', 'Agregado al carrito', `${quantity}x ${product.nombre}`);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: targetQty } : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && quantity > prod.stock) {
      addToast(
        'warning',
        'Stock límite alcanzado',
        `Solo quedan ${prod.stock} unidades disponibles de ${prod.nombre}.`
      );
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Repeat previous order verifying current stock & price
  const repeatOrder = (pastOrder: Order) => {
    if (currentUser?.tipoAlumno === 'colaborador') {
      addToast(
        'info',
        'Modalidad Alumno Colaborador',
        'Tu cuenta está en modalidad presencial. Podés consultar el historial para pedir directamente en mostrador.'
      );
      return;
    }

    let addedCount = 0;
    const unavailable: string[] = [];
    const priceChanged: string[] = [];
    const stockLimited: string[] = [];

    const newCart: CartItem[] = [...cart];

    for (const item of pastOrder.items) {
      const liveProd = products.find((p) => p.id === item.productoId);

      if (!liveProd || liveProd.estado === 'desactivado' || liveProd.estado === 'agotado' || liveProd.stock <= 0) {
        unavailable.push(item.productoNombre);
        continue;
      }

      const livePrice =
        liveProd.enPromocion && liveProd.precioPromocional
          ? liveProd.precioPromocional
          : liveProd.precioVenta;

      if (livePrice !== item.precioUnitario) {
        priceChanged.push(`${liveProd.nombre} ($${item.precioUnitario} ➔ $${livePrice})`);
      }

      const existingIdx = newCart.findIndex((c) => c.product.id === liveProd.id);
      const currentInCart = existingIdx >= 0 ? newCart[existingIdx].quantity : 0;
      const desiredTotal = currentInCart + item.cantidad;

      if (desiredTotal > liveProd.stock) {
        stockLimited.push(`${liveProd.nombre} (máx. disponible: ${liveProd.stock})`);
      }

      const finalQty = Math.min(desiredTotal, liveProd.stock);

      if (finalQty > currentInCart) {
        addedCount += (finalQty - currentInCart);
        if (existingIdx >= 0) {
          newCart[existingIdx].quantity = finalQty;
        } else {
          newCart.push({ product: liveProd, quantity: finalQty });
        }
      }
    }

    setCart(newCart);

    if (addedCount > 0) {
      playChime('success');
      let details: string[] = [];
      if (priceChanged.length > 0) details.push(`Precios actualizados: ${priceChanged.join(', ')}`);
      if (stockLimited.length > 0) details.push(`Stock ajustado: ${stockLimited.join(', ')}`);
      if (unavailable.length > 0) details.push(`Agotados/no disponibles: ${unavailable.join(', ')}`);

      addToast(
        unavailable.length > 0 ? 'warning' : 'success',
        `¡Pedido #${pastOrder.numeroPedido} repetido!`,
        details.length > 0 ? details.join(' | ') : 'Todos los productos fueron agregados a tu carrito.'
      );
      setCartOpen(true);
    } else {
      addToast(
        'error',
        'No se pudo repetir el pedido',
        unavailable.length > 0
          ? `Los siguientes productos están agotados o ya no están en catálogo: ${unavailable.join(', ')}.`
          : 'Verificá la disponibilidad de stock en el catálogo.'
      );
    }
  };

  // Toggle favorite
  const toggleFavorite = async (productId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      addToast('info', 'Iniciá sesión', 'Iniciá sesión para guardar tus productos favoritos.');
      return;
    }

    if (currentUser.tipoAlumno === 'colaborador') {
      addToast(
        'info',
        'Modalidad Alumno Colaborador',
        'Tus compras son presenciales en el kiosco escolar. No es necesario gestionar favoritos para comprar.'
      );
      return;
    }

    try {
      const res = await fetch('/api/auth/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedFavs = data.favorites;
        const updatedUser = { ...currentUser, favorites: updatedFavs };
        setCurrentUser(updatedUser);
        localStorage.setItem('kiosco_user', JSON.stringify(updatedUser));

        const isFav = updatedFavs.includes(productId);
        addToast(
          isFav ? 'success' : 'info',
          isFav ? '❤️ Agregado a favoritos' : 'Eliminado de favoritos'
        );
      }
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        token,
        theme,
        toggleTheme,
        userExperience,
        setUserExperience,
        activeAdminTab,
        setActiveAdminTab,
        activeShopTab,
        setActiveShopTab,
        products,
        categories,
        suppliers,
        orders,
        settings,
        cart,
        cartOpen,
        setCartOpen,
        checkoutOpen,
        setCheckoutOpen,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        privacyModalOpen,
        setPrivacyModalOpen,
        excelImportModalOpen,
        setExcelImportModalOpen,
        notificationsOpen,
        setNotificationsOpen,
        notifications,
        unreadNotificationsCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        repeatOrder,
        activeVoucherOrder,
        setActiveVoucherOrder,
        lastOrderPlaced,
        setLastOrderPlaced,
        pendingOrdersCount,
        toasts,
        addToast,
        removeToast,
        login,
        loginWithGoogle,
        register,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleFavorite,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
