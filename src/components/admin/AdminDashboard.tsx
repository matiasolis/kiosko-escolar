import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FinanceStats, Order } from '../../types';
import { formatCurrency, formatTime, formatDateTime } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportUtils';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Award,
  Calendar,
  Wallet,
  ArrowRight,
  Clock,
  CheckCircle2,
  Store,
  ChevronRight,
  Flame,
  FileText,
  Plus,
  FileSpreadsheet,
  Download,
  Landmark,
  Lock,
  Unlock,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    products,
    setActiveAdminTab,
    token,
    addToast,
    refreshAllData,
    setActiveVoucherOrder,
    setExcelImportModalOpen,
  } = useApp();

  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [cashStatus, setCashStatus] = useState<{
    fecha: string;
    isOpen: boolean;
    existingClosure: any;
    summary: any;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const [resFinances, resCash] = await Promise.all([
        fetch('/api/finances/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/cash/status', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resFinances.ok) {
        const data = await resFinances.json();
        setStats(data.stats);
      }
      if (resCash.ok) {
        const data = await resCash.json();
        setCashStatus(data.status);
      }
    } catch (e) {
      console.error('Error fetching stats', e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token, orders]);

  // Quick export of today's sales
  const handleQuickExportVentas = () => {
    if (!orders.length) {
      addToast('info', 'No hay ventas para exportar hoy.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.fecha.slice(0, 10) === today);
    const targetList = todayOrders.length > 0 ? todayOrders : orders;

    exportToCsv(
      `ventas_kiosControl_${today}`,
      [
        { key: 'numeroPedido', label: 'N° Pedido' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'clienteNombre', label: 'Alumno' },
        { key: 'clienteEmail', label: 'Email' },
        {
          key: 'items',
          label: 'Productos',
          format: (items: any[]) => items.map((i) => `${i.cantidad}x ${i.productoNombre}`).join('; '),
        },
        { key: 'total', label: 'Total ($)' },
        { key: 'metodoPago', label: 'Medio de Pago' },
        { key: 'estadoPago', label: 'Estado Pago' },
        { key: 'estado', label: 'Estado Pedido' },
      ],
      targetList
    );

    addToast('success', 'Archivo CSV descargado', 'Se descargó el reporte de ventas del día.');
  };

  // Priority queue: Pending orders
  const pendingOrders = orders.filter((o) => o.estado === 'pendiente');
  const preparingOrders = orders.filter((o) => o.estado === 'preparando');

  // Low stock items
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.stockMinimo && p.estado !== 'desactivado'
  );

  // Quick action: advance order status
  const handleAdvanceStatus = async (orderId: string, nextStatus: 'preparando' | 'listo' | 'entregado') => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nextStatus }),
      });
      if (res.ok) {
        addToast(
          'success',
          `Pedido actualizado a "${nextStatus}"`,
          'El alumno verá el nuevo estado en tiempo real.'
        );
        refreshAllData();
      }
    } catch (e) {
      addToast('error', 'Error al actualizar pedido');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* INTELLIGENT PRIORITY SECTION: URGENT PENDING ORDERS BANNER    */}
      {/* ------------------------------------------------------------- */}
      {pendingOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 p-5 sm:p-6 shadow-xl shadow-rose-500/5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-200 dark:border-rose-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 animate-bounce">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100">
                    🔴 Pedidos Pendientes de Preparación
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
                    {pendingOrders.length}
                  </span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Prioridad operativa inmediata: alumnos esperando su pedido en el kiosco.
                </p>
              </div>
            </div>

            <button
              id="view-all-orders-from-priority-banner"
              onClick={() => setActiveAdminTab('orders')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              Ver Cola de Pedidos
            </button>
          </div>

          {/* Cards for pending orders */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        Pedido #{order.numeroPedido}
                      </span>
                      <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        {order.clienteVisible} ({order.clienteNombre})
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0">
                      {formatTime(order.fecha)}
                    </span>
                  </div>

                  {/* Delivery mode */}
                  <div className="mb-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Retiro:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {order.modalidadRetiro === 'inmediato'
                        ? '⚡ Inmediato'
                        : `🕐 Recreo (${order.recreoHora})`}
                    </strong>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1 py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>
                          <strong className="text-slate-900 dark:text-white">{it.cantidad}×</strong> {it.productoNombre}
                        </span>
                        <span className="font-semibold text-slate-500">{formatCurrency(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`ticket-btn-${order.numeroPedido}`}
                      onClick={() => setActiveVoucherOrder(order)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                      title="Ver Comprobante"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-preparar-${order.numeroPedido}`}
                      onClick={() => handleAdvanceStatus(order.id, 'preparando')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Preparar Pedido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EXECUTIVE FINANCIAL & KPI METRICS                              */}
      {/* ------------------------------------------------------------- */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Métricas Generales del Kiosco
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Ventas Hoy */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Ventas de Hoy</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {formatCurrency(stats?.ventasHoy || 0)}
            </div>
            <div className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Ganancia estimada: {formatCurrency(stats?.gananciasHoy || 0)}</span>
            </div>
          </div>

          {/* Card 2: Pedidos Pendientes & Activos */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Pedidos Pendientes</span>
              <div
                className={`p-2 rounded-xl ${
                  pendingOrders.length > 0
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {pendingOrders.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {preparingOrders.length} en preparación actualmente
            </div>
          </div>

          {/* Card 3: Stock Crítico */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Stock Bajo / Reposición</span>
              <div
                className={`p-2 rounded-xl ${
                  lowStockProducts.length > 0
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {lowStockProducts.length}
            </div>
            <button
              id="goto-stock-alerts-btn"
              onClick={() => setActiveAdminTab('stock')}
              className="mt-1 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver lista de compras necesarias</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 4: Caja del Día */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Caja del Día</span>
              <div
                className={`p-2 rounded-xl ${
                  cashStatus?.isOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {cashStatus?.isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-2xl font-black ${
                  cashStatus?.isOpen
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {cashStatus?.isOpen ? 'Abierta' : 'Cerrada'}
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  cashStatus?.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </div>
            <button
              id="goto-cash-register-dashboard-btn"
              onClick={() => setActiveAdminTab('cash')}
              className="mt-1 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{cashStatus?.isOpen ? 'Arqueo esperado: ' + formatCurrency(cashStatus?.summary.resultadoEsperado || 0) : 'Ver balance del cierre'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACCIONES RÁPIDAS PRIORITARIAS                                 */}
      {/* ------------------------------------------------------------- */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Nuevo Producto */}
          <button
            id="dash-quick-new-product"
            onClick={() => setActiveAdminTab('products')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-left transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Nuevo Producto</span>
            <span className="text-[10px] text-slate-400">Crear ítem al catálogo</span>
          </button>

          {/* Importar Excel */}
          <button
            id="dash-quick-import-excel"
            onClick={() => setExcelImportModalOpen(true)}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Importar Excel</span>
            <span className="text-[10px] text-slate-400">Carga masiva .xlsx / .csv</span>
          </button>

          {/* Ver Pedidos */}
          <button
            id="dash-quick-view-orders"
            onClick={() => setActiveAdminTab('orders')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 text-left transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform relative">
              <ShoppingBag className="w-4 h-4" />
              {pendingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Ver Pedidos</span>
            <span className="text-[10px] text-slate-400">Cola activa ({pendingOrders.length} pendientes)</span>
          </button>

          {/* Cerrar Caja */}
          <button
            id="dash-quick-close-cash"
            onClick={() => setActiveAdminTab('cash')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Cierre de Caja</span>
            <span className="text-[10px] text-slate-400">Arqueo y balance formal</span>
          </button>

          {/* Exportar CSV */}
          <button
            id="dash-quick-export-csv"
            onClick={handleQuickExportVentas}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Exportar CSV</span>
            <span className="text-[10px] text-slate-400">Descargar ventas del día</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECONDARY ROW: BESTSELLER & QUICK RECENT ORDERS               */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bestseller Highlight & Quick Restock Table */}
        <div className="space-y-6">
          {/* Bestseller Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              <Award className="w-4 h-4" />
              <span>Producto Más Vendido</span>
            </div>
            {stats?.productoMasVendido ? (
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {stats.productoMasVendido.nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {stats.productoMasVendido.cantidad} unidades vendidas este período (
                  {formatCurrency(stats.productoMasVendido.total)})
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Sin datos de ventas aún.</p>
            )}
          </div>

          {/* Low stock alerts summary */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Alerta de Stock Crítico
              </h3>
              <button
                id="btn-ver-inventario-desde-dashboard"
                onClick={() => setActiveAdminTab('stock')}
                className="text-xs text-sky-600 font-bold hover:underline"
              >
                Inventario
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-xs text-emerald-600 flex items-center gap-1.5 py-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Todos los productos tienen stock saludable.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{p.nombre}</span>
                      <span className="text-[11px] text-slate-400 block">Mínimo: {p.stockMinimo} u.</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                      Quedan {p.stock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Recent Orders Stream */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Últimos Pedidos Registrados
                </h3>
                <span className="text-xs text-slate-500">Historial en tiempo real de transacciones</span>
              </div>
              <button
                id="btn-ver-todos-pedidos-dashboard"
                onClick={() => setActiveAdminTab('orders')}
                className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No hay pedidos registrados todavía.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2.5">Pedido</th>
                      <th className="pb-2.5">Alumno</th>
                      <th className="pb-2.5">Modalidad</th>
                      <th className="pb-2.5">Total</th>
                      <th className="pb-2.5">Estado</th>
                      <th className="pb-2.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 6).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                          #{ord.numeroPedido}
                        </td>
                        <td className="py-2.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {ord.clienteVisible}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500">
                          {ord.modalidadRetiro === 'inmediato' ? '⚡ Inmediato' : `🕐 Recreo`}
                        </td>
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(ord.total)}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              ord.estado === 'pendiente'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : ord.estado === 'preparando'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : ord.estado === 'listo'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {ord.estado}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            id={`view-voucher-dash-${ord.numeroPedido}`}
                            onClick={() => setActiveVoucherOrder(ord)}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded-lg"
                            title="Ver ticket"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
