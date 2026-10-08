import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CashRegisterClosure } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportUtils';
import {
  DollarSign,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  Receipt,
  RotateCcw,
  Eye,
  X,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminCashRegister: React.FC = () => {
  const { token, addToast, refreshAllData, currentUser } = useApp();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Status for today
  const [statusData, setStatusData] = useState<{
    fecha: string;
    isOpen: boolean;
    existingClosure: CashRegisterClosure | null;
    summary: {
      ventasTotales: number;
      ventasEfectivo: number;
      ventasTransferencia: number;
      ventasOtros: number;
      gastosTotales: number;
      resultadoEsperado: number;
    };
  } | null>(null);

  // Closure form
  const [dineroContado, setDineroContado] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [closureConfirmOpen, setClosureConfirmOpen] = useState(false);

  // Closures history
  const [closures, setClosures] = useState<CashRegisterClosure[]>([]);
  const [selectedClosure, setSelectedClosure] = useState<CashRegisterClosure | null>(null);

  const fetchCashData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [resStatus, resClosures] = await Promise.all([
        fetch('/api/cash/status', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/cash/closures', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resStatus.ok) {
        const data = await resStatus.json();
        setStatusData(data.status);
        if (data.status.existingClosure && data.status.existingClosure.estado === 'cerrada') {
          setDineroContado(String(data.status.existingClosure.dineroContado));
          setObservaciones(data.status.existingClosure.observaciones || '');
        } else {
          // default counted to expected for smooth cashier experience
          if (!dineroContado) {
            setDineroContado(String(data.status.summary.resultadoEsperado || ''));
          }
        }
      }

      if (resClosures.ok) {
        const data = await resClosures.json();
        setClosures(data.closures || []);
      }
    } catch (e) {
      console.error('Error fetching cash data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashData();
  }, [token]);

  const contadoNumber = Number(dineroContado) || 0;
  const resultadoEsperado = statusData?.summary.resultadoEsperado || 0;
  const liveDiferencia = contadoNumber - resultadoEsperado;

  const handleCloseCashRegister = async () => {
    if (!statusData) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/cash/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha: statusData.fecha,
          dineroContado: contadoNumber,
          observaciones: observaciones.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al cerrar caja');
        return;
      }

      addToast(
        'success',
        '¡Caja diaria cerrada con éxito!',
        `Cierre formal registrado por ${currentUser?.nombreVisible || 'Admin'}.`
      );

      setClosureConfirmOpen(false);
      await fetchCashData();
      await refreshAllData();
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopen = async (fecha: string) => {
    try {
      const res = await fetch('/api/cash/reopen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fecha }),
      });
      if (res.ok) {
        addToast('info', 'Caja reabierta', `Se habilitó la edición de la caja del día ${fecha}.`);
        fetchCashData();
      }
    } catch (e) {
      addToast('error', 'Error al reabrir caja');
    }
  };

  const handleExportClosures = () => {
    if (!closures.length) {
      addToast('info', 'No hay registros de cierre para exportar.');
      return;
    }

    exportToCsv(
      `cierres_caja_kiosControl_${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'fecha', label: 'Fecha' },
        { key: 'horaApertura', label: 'Hora Apertura' },
        { key: 'horaCierre', label: 'Hora Cierre' },
        { key: 'responsableNombre', label: 'Responsable' },
        { key: 'ventasTotales', label: 'Ventas Totales ($)' },
        { key: 'ventasEfectivo', label: 'Ventas Efectivo ($)' },
        { key: 'ventasTransferencia', label: 'Ventas Transferencia/MP ($)' },
        { key: 'gastosTotales', label: 'Gastos ($)' },
        { key: 'resultadoEsperado', label: 'Resultado Esperado ($)' },
        { key: 'dineroContado', label: 'Dinero Contado ($)' },
        { key: 'diferencia', label: 'Diferencia ($)' },
        { key: 'estado', label: 'Estado' },
        { key: 'observaciones', label: 'Observaciones' },
      ],
      closures
    );

    addToast('success', 'Archivo CSV descargado', 'Historial de cierres de caja exportado exitosamente.');
  };

  const isClosed = !statusData?.isOpen;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Cierre de Caja Diario
            </h2>
            {isClosed ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Caja Cerrada</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 animate-pulse">
                <Unlock className="w-3 h-3" />
                <span>Caja Abierta</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arqueo formal de caja, conciliación de efectivo, transferencias y cierre de jornada escolar.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="export-cash-closures-csv-btn"
            onClick={handleExportClosures}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TODAY'S CASH DASHBOARD                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Jornada Contable
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Fecha: {statusData?.fecha || new Date().toISOString().slice(0, 10)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Responsable de Caja</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {statusData?.existingClosure?.responsableNombre ||
                  currentUser?.nombreVisible ||
                  'Prof. Roberto Gómez'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs uppercase">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Dashboard Metrics Breakdown */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ventas del día */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ventas del Día
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(statusData?.summary.ventasTotales || 0)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Facturación bruta total</span>
            </div>

            {/* Efectivo */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Efectivo
                </span>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {formatCurrency(statusData?.summary.ventasEfectivo || 0)}
              </div>
              <span className="text-[11px] text-emerald-600/80 mt-1 block">Ingresos en billetes/monedas</span>
            </div>

            {/* Transferencias / MercadoPago */}
            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Transferencias / MP
                </span>
                <Smartphone className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-sky-700 dark:text-sky-300 mt-1">
                {formatCurrency(statusData?.summary.ventasTransferencia || 0)}
              </div>
              <span className="text-[11px] text-sky-600/80 mt-1 block">Acreditado en cuenta digital</span>
            </div>

            {/* Gastos del día */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Gastos del Día
                </span>
                <Receipt className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {formatCurrency(statusData?.summary.gastosTotales || 0)}
              </div>
              <span className="text-[11px] text-amber-600/80 mt-1 block">Pagos e insumos de la jornada</span>
            </div>
          </div>

          {/* Arqueo Form & Real-time Difference Calculation */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-sky-600" />
              <span>Arqueo de Efectivo & Conciliación</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Resultado Esperado */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Resultado Esperado en Efectivo
                </label>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white">
                  {formatCurrency(resultadoEsperado)}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  (Efectivo ventas: {formatCurrency(statusData?.summary.ventasEfectivo || 0)} - Gastos: {formatCurrency(statusData?.summary.gastosTotales || 0)})
                </span>
              </div>

              {/* Dinero Contado Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dinero Realmente Contado ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">$</span>
                  <input
                    id="cash-counted-input"
                    type="number"
                    min="0"
                    step="50"
                    disabled={isClosed}
                    value={dineroContado}
                    onChange={(e) => setDineroContado(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2.5 text-base font-black rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:opacity-70"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Ingresá el total físico contado en billetes y monedas.
                </span>
              </div>

              {/* Diferencia Display */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Diferencia de Caja
                </label>
                <div
                  className={`p-3 rounded-xl border text-lg font-black flex items-center justify-between ${
                    liveDiferencia === 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : liveDiferencia > 0
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <span>
                    {liveDiferencia === 0
                      ? '$0 (Exacto)'
                      : `${liveDiferencia > 0 ? '+' : ''}${formatCurrency(liveDiferencia)}`}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {liveDiferencia === 0
                      ? 'Balanceada'
                      : liveDiferencia > 0
                      ? 'Sobrante'
                      : 'Faltante'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Cálculo automático: Contado vs Resultado Esperado.
                </span>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Observaciones del Arqueo / Cierre
              </label>
              <input
                id="cash-observations-input"
                type="text"
                disabled={isClosed}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Redondeo en caramelos durante recreo matutino, billete dañado apartado..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-60"
              />
            </div>

            {/* Actions for Today's Cash Register */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {isClosed ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>
                      Caja cerrada a las {statusData?.existingClosure?.horaCierre || '17:00'} hs por{' '}
                      <strong>{statusData?.existingClosure?.responsableNombre}</strong>.
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">
                    Verificá los valores antes de confirmar el cierre formal.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isClosed ? (
                  <button
                    id="reopen-cash-btn"
                    onClick={() => handleReopen(statusData!.fecha)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reabrir Caja para Corrección</span>
                  </button>
                ) : (
                  <button
                    id="close-cash-register-trigger-btn"
                    onClick={() => setClosureConfirmOpen(true)}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cerrar Caja del Día</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CLOSURES HISTORY SECTION                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Historial de Cierres de Caja
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auditoría formal de jornadas anteriores con responsables y diferencias registradas.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {closures.length} {closures.length === 1 ? 'cierre' : 'cierres'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Responsable</th>
                <th className="p-3.5">Total Vendido</th>
                <th className="p-3.5">Gastos</th>
                <th className="p-3.5">Resultado Esperado</th>
                <th className="p-3.5">Dinero Contado</th>
                <th className="p-3.5">Diferencia</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {closures.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.fecha}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                    {c.responsableNombre}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(c.ventasTotales)}
                  </td>
                  <td className="p-3.5 text-amber-600 dark:text-amber-400">
                    {formatCurrency(c.gastosTotales)}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(c.resultadoEsperado)}
                  </td>
                  <td className="p-3.5 font-black text-slate-900 dark:text-white">
                    {formatCurrency(c.dineroContado)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-black ${
                        c.diferencia === 0
                          ? 'text-emerald-600'
                          : c.diferencia > 0
                          ? 'text-sky-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {c.diferencia === 0
                        ? '$0'
                        : `${c.diferencia > 0 ? '+' : ''}${formatCurrency(c.diferencia)}`}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        c.estado === 'cerrada'
                          ? c.diferencia === 0
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {c.estado === 'cerrada' ? 'Cerrada' : 'Abierta'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      id={`view-closure-${c.id}`}
                      onClick={() => setSelectedClosure(c)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg transition-colors cursor-pointer"
                      title="Ver detalle de arqueo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {closureConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                ¿Confirmar Cierre de Caja?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción registrará formalmente el fin de la actividad económica del día{' '}
                <strong>{statusData?.fecha}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Ventas totales:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(statusData?.summary.ventasTotales || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resultado esperado efectivo:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(resultadoEsperado)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dinero contado ingresado:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {formatCurrency(contadoNumber)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                <span>Diferencia calculada:</span>
                <span
                  className={
                    liveDiferencia === 0
                      ? 'text-emerald-600'
                      : liveDiferencia > 0
                      ? 'text-sky-600'
                      : 'text-rose-600'
                  }
                >
                  {liveDiferencia === 0
                    ? '$0 (Exacto)'
                    : `${liveDiferencia > 0 ? '+' : ''}${formatCurrency(liveDiferencia)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="cancel-closure-modal-btn"
                onClick={() => setClosureConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                Volver
              </button>
              <button
                id="confirm-close-cash-btn"
                onClick={handleCloseCashRegister}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {submitting ? 'Cerrando...' : 'Confirmar Cierre'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Closure Detail Modal */}
      {selectedClosure && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Detalle de Cierre de Caja
                  </h3>
                  <span className="text-xs text-slate-400">Jornada {selectedClosure.fecha}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedClosure(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block">Responsable</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedClosure.responsableNombre}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Horario de Actividad</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedClosure.horaApertura} a {selectedClosure.horaCierre || '-'} hs
                  </span>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ventas en Efectivo:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedClosure.ventasEfectivo)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ventas en Transferencia / MP:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedClosure.ventasTransferencia)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gastos e insumos:</span>
                  <span className="font-bold text-amber-600">
                    -{formatCurrency(selectedClosure.gastosTotales)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                  <span>Resultado esperado:</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(selectedClosure.resultadoEsperado)}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Dinero contado físicamente:</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(selectedClosure.dineroContado)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Diferencia final:</span>
                  <span
                    className={
                      selectedClosure.diferencia === 0
                        ? 'text-emerald-600'
                        : selectedClosure.diferencia > 0
                        ? 'text-sky-600'
                        : 'text-rose-600'
                    }
                  >
                    {selectedClosure.diferencia === 0
                      ? '$0 (Sin diferencia)'
                      : `${selectedClosure.diferencia > 0 ? '+' : ''}${formatCurrency(
                          selectedClosure.diferencia
                        )}`}
                  </span>
                </div>
              </div>

              {selectedClosure.observaciones && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Observaciones registradas:
                  </span>
                  {selectedClosure.observaciones}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedClosure(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cerrar Detalle
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
