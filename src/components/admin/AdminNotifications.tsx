import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppNotification, NotificationCategory } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import {
  Bell,
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
  Filter,
  Plus,
  Send,
  X,
  AlertTriangle,
  Megaphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveAdminTab,
    token,
    addToast,
    refreshAllData,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New notification form
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [categoria, setCategoria] = useState<NotificationCategory>('promociones');
  const [prioridad, setPrioridad] = useState<'normal' | 'alta'>('normal');
  const [targetRole, setTargetRole] = useState<'cliente' | 'admin' | 'all'>('cliente');
  const [actionTab, setActionTab] = useState<'catalog' | 'orders' | 'profile'>('catalog');
  const [submitting, setSubmitting] = useState(false);

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

  const getCategoryBadge = (cat: NotificationCategory) => {
    switch (cat) {
      case 'pedidos':
        return 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'stock':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'caja':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'promociones':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'excel':
        return 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'institucional':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterCategory !== 'all' && n.categoria !== filterCategory) return false;
    if (filterStatus === 'unread' && n.leida) return false;
    if (filterStatus === 'read' && !n.leida) return false;
    return true;
  });

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensaje.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          mensaje: mensaje.trim(),
          categoria,
          prioridad,
          targetRole,
          actionTab,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al emitir notificación');
        return;
      }

      addToast('success', 'Aviso Publicado', 'La notificación fue enviada a los alumnos del colegio.');
      setCreateModalOpen(false);
      setTitulo('');
      setMensaje('');
      refreshAllData();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Centro de Notificaciones & Alertas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Avisos de pedidos, estado de caja, stock mínimo, carga de Excel y comunicados a alumnos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadNotificationsCount > 0 && (
            <button
              id="admin-mark-all-read-btn"
              onClick={() => markAllNotificationsAsRead()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-sky-500" />
              <span>Marcar todas como leídas</span>
            </button>
          )}

          <button
            id="admin-open-create-notification-btn"
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Aviso o Promoción</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-semibold">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'pedidos', label: 'Pedidos' },
            { id: 'stock', label: 'Stock' },
            { id: 'caja', label: 'Caja' },
            { id: 'excel', label: 'Excel' },
            { id: 'promociones', label: 'Promociones' },
            { id: 'institucional', label: 'Institucional' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'unread'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sin leer ({unreadNotificationsCount})
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'read'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Leídas ({notifications.length - unreadNotificationsCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No hay notificaciones con los filtros seleccionados
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Los avisos del sistema se listarán aquí en tiempo real a medida que ocurran eventos en el kiosco.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.leida;
            const isHighPriority = notif.prioridad === 'alta';

            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnread
                    ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 shrink-0">
                      {getCategoryIcon(notif.categoria)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {notif.titulo}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${getCategoryBadge(
                            notif.categoria
                          )}`}
                        >
                          {notif.categoria}
                        </span>

                        {isHighPriority && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            Alta Prioridad
                          </span>
                        )}

                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.mensaje}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateTime(notif.fecha)}</span>
                        </span>

                        {notif.targetRole && (
                          <span>
                            Audiencia:{' '}
                            <strong className="text-slate-600 dark:text-slate-300 capitalize">
                              {notif.targetRole === 'cliente'
                                ? 'Alumnos'
                                : notif.targetRole === 'admin'
                                ? 'Administración'
                                : 'Todos'}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {notif.actionTab && (
                      <button
                        onClick={() => {
                          if (isUnread) markNotificationAsRead(notif.id);
                          setActiveAdminTab(notif.actionTab as any);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Abrir sección</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {isUnread ? (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Marcar como leída"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-semibold px-2 py-1">
                        Leída
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Announcement */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-50 dark:bg-sky-950 text-sky-600 rounded-xl">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Emitir Notificación o Aviso Escolar
                    </h3>
                    <p className="text-xs text-slate-400">
                      Llegará a la campana de notificaciones de los alumnos y la administración.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Título de la Notificación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ¡Llegó nuevo stock de alfajores artesanales!"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mensaje / Detalle *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escribí el texto que leerán los alumnos o el equipo del kiosco..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="promociones">🎉 Promociones</option>
                      <option value="institucional">📢 Institucional</option>
                      <option value="pedidos">🛍️ Pedidos</option>
                      <option value="stock">📦 Stock</option>
                      <option value="caja">💵 Caja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Prioridad
                    </label>
                    <select
                      value={prioridad}
                      onChange={(e) => setPrioridad(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="normal">Normal</option>
                      <option value="alta">Alta (Alerta destacada)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Destinatarios
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="cliente">Alumnos (Kios Mercado)</option>
                      <option value="admin">Administración únicamente</option>
                      <option value="all">Toda la comunidad escolar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Destino al hacer clic
                    </label>
                    <select
                      value={actionTab}
                      onChange={(e) => setActionTab(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="catalog">Catálogo de Productos</option>
                      <option value="orders">Mis Pedidos</option>
                      <option value="profile">Mi Perfil</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Enviando...' : 'Publicar Notificación'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
