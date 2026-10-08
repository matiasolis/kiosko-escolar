import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppNotification, NotificationCategory } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import {
  Bell,
  X,
  CheckCheck,
  Check,
  ShoppingBag,
  Boxes,
  DollarSign,
  Sparkles,
  FileSpreadsheet,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationsDrawer: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    notificationsOpen,
    setNotificationsOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveAdminTab,
    setActiveShopTab,
    setUserExperience,
    currentUser,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!notificationsOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    return n.categoria === activeCategory;
  });

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'pedidos':
        return <ShoppingBag className="w-4 h-4 text-sky-500" />;
      case 'stock':
        return <Boxes className="w-4 h-4 text-amber-500" />;
      case 'caja':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'promociones':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-teal-500" />;
      case 'institucional':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (cat: NotificationCategory) => {
    switch (cat) {
      case 'pedidos':
        return 'Pedidos';
      case 'stock':
        return 'Stock';
      case 'caja':
        return 'Caja';
      case 'promociones':
        return 'Promoción';
      case 'excel':
        return 'Excel';
      case 'institucional':
        return 'Institucional';
      default:
        return 'Sistema';
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.leida) {
      markNotificationAsRead(notif.id);
    }

    if (notif.actionTab) {
      if (currentUser?.role === 'admin') {
        setUserExperience('admin');
        setActiveAdminTab(notif.actionTab as any);
      } else {
        setUserExperience('shop');
        setActiveShopTab(notif.actionTab as any);
      }
      setNotificationsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="notifications-drawer-backdrop"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 dark:bg-sky-950 text-sky-600 rounded-xl relative">
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Notificaciones
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadNotificationsCount > 0
                    ? `${unreadNotificationsCount} sin leer`
                    : 'Todo al día'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotificationsCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={() => markAllNotificationsAsRead()}
                  className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold px-2 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Marcar leídas</span>
                </button>
              )}
              <button
                id="close-notifications-btn"
                onClick={() => setNotificationsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pedidos', label: 'Pedidos' },
              { id: 'stock', label: 'Stock' },
              { id: 'caja', label: 'Caja' },
              { id: 'promociones', label: 'Promos' },
              { id: 'excel', label: 'Excel' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`notif-filter-${tab.id}`}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Sin notificaciones
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {activeCategory === 'all'
                    ? 'No tenés notificaciones pendientes en este momento.'
                    : `No hay notificaciones en la categoría ${activeCategory}.`}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isUnread = !n.leida;
                const isUrgent = n.prioridad === 'alta';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      isUnread
                        ? isUrgent
                          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs'
                          : 'border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getCategoryIcon(n.categoria)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              {getCategoryLabel(n.categoria)}
                            </span>
                            {isUrgent && (
                              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                · Urgente
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(n.fecha)}</span>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                          {n.titulo}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {n.mensaje}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between">
                          {n.actionTab ? (
                            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:underline">
                              <span>Ver detalle</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          ) : (
                            <span />
                          )}

                          {isUnread && (
                            <button
                              id={`mark-read-${n.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(n.id);
                              }}
                              className="text-[11px] font-semibold text-slate-400 hover:text-sky-600 p-1 rounded-md"
                              title="Marcar como leída"
                            >
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Unread dot */}
                      {isUnread && (
                        <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
