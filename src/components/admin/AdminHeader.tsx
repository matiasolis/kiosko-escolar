import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, Bell, Volume2, VolumeX, Store, Clock } from 'lucide-react';

interface AdminHeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ setMobileOpen }) => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    pendingOrdersCount,
    settings,
    setUserExperience,
    setNotificationsOpen,
    unreadNotificationsCount,
  } = useApp();

  const getTabTitle = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return 'Panel Principal & Métricas';
      case 'orders':
        return 'Gestión de Pedidos en Vivo';
      case 'products':
        return 'Catálogo de Productos & Precios';
      case 'stock':
        return 'Control de Stock e Inventario';
      case 'cash':
        return 'Cierre de Caja Diario & Arqueo';
      case 'finances':
        return 'Flujo de Ventas y Finanzas';
      case 'clients':
        return 'Gestión de Alumnos (Digital / Colaborador)';
      case 'notifications':
        return 'Centro de Notificaciones & Alertas';
      case 'statistics':
        return 'Estadísticas & Análisis';
      case 'suppliers':
        return 'Directorio de Proveedores';
      case 'purchases':
        return 'Compras a Proveedores & Reposición';
      case 'activity':
        return 'Historial de Auditoría & Actividad';
      case 'settings':
        return 'Configuración General del Kiosco';
      default:
        return 'Administración';
    }
  };

  return (
    <header
      id="admin-header"
      className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="admin-mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            className="p-2 lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {getTabTitle()}
            </h1>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              kiosControl • Sistema de Gestión de Kiosco
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <button
            id="admin-header-notifications-btn"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Ver Notificaciones"
            title="Notificaciones y Alertas"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Pending Orders Live Alert */}
          {pendingOrdersCount > 0 ? (
            <button
              id="admin-header-pending-orders-badge"
              onClick={() => setActiveAdminTab('orders')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold animate-pulse cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-rose-600" />
              <span>{pendingOrdersCount} {pendingOrdersCount === 1 ? 'Pedido' : 'Pedidos'}</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Kiosco al día</span>
            </div>
          )}

          {/* Quick switch to Student store */}
          <button
            id="admin-header-shop-btn"
            onClick={() => setUserExperience('shop')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Kios Mercado</span>
          </button>
        </div>
      </div>
    </header>
  );
};
