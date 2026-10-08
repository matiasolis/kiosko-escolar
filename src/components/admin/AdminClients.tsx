import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, TipoAlumno } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportUtils';
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  ShoppingBag,
  DollarSign,
  ShieldAlert,
  Download,
  BadgeCheck,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { token, addToast } = useApp();

  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState<'all' | 'digital' | 'colaborador'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const handleToggleBlock = async (client: User) => {
    const nextBlocked = !client.isBlocked;
    try {
      const res = await fetch(`/api/clients/${client.id}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked: nextBlocked }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al cambiar estado');
        return;
      }
      addToast(
        'success',
        nextBlocked ? 'Cuenta Suspendida' : 'Cuenta Habilitada',
        `El alumno ${client.nombreVisible} ahora está ${nextBlocked ? 'bloqueado' : 'habilitado'}.`
      );
      fetchClients();
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  const handleToggleModality = async (client: User) => {
    const nextModality: TipoAlumno =
      client.tipoAlumno === 'colaborador' ? 'digital' : 'colaborador';
    setUpdatingId(client.id);
    try {
      const res = await fetch(`/api/clients/${client.id}/modality`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipoAlumno: nextModality }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al cambiar modalidad');
        return;
      }
      addToast(
        'success',
        'Modalidad actualizada',
        `El alumno ${client.nombreVisible} ahora es "${
          nextModality === 'colaborador' ? 'Alumno Colaborador (Presencial)' : 'Alumno Digital'
        }".`
      );
      fetchClients();
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = () => {
    if (!filtered.length) {
      addToast('info', 'No hay alumnos para exportar con el filtro actual.');
      return;
    }

    exportToCsv(
      `alumnos_kiosControl_${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'nombreVisible', label: 'Nombre Visible' },
        { key: 'email', label: 'Email Institucional' },
        {
          key: 'tipoAlumno',
          label: 'Modalidad de Alumno',
          format: (tipo) =>
            tipo === 'colaborador' ? 'Alumno Colaborador (Presencial)' : 'Alumno Digital',
        },
        { key: 'orderCount', label: 'Cantidad Pedidos' },
        { key: 'totalSpent', label: 'Total Consumido ($)' },
        {
          key: 'isBlocked',
          label: 'Estado Cuenta',
          format: (blocked) => (blocked ? 'Bloqueado' : 'Activo'),
        },
      ],
      filtered
    );

    addToast('success', 'Archivo CSV descargado', `Se exportaron ${filtered.length} alumnos.`);
  };

  const filtered = clients.filter((c) => {
    // Filter modality
    if (filterModality === 'digital' && c.tipoAlumno === 'colaborador') return false;
    if (filterModality === 'colaborador' && c.tipoAlumno !== 'colaborador') return false;

    // Filter search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.nombreVisible.toLowerCase().includes(q) ||
      c.nombre.toLowerCase().includes(q) ||
      c.apellido.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const digitalCount = clients.filter((c) => c.tipoAlumno !== 'colaborador').length;
  const colabCount = clients.filter((c) => c.tipoAlumno === 'colaborador').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestión de Alumnos & Modalidades
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Diferenciación entre <strong>Alumnos Digitales</strong> (pedidos online) y{' '}
            <strong>Alumnos Colaboradores</strong> (compra presencial física en kiosco).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="export-clients-csv-btn"
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Exportar alumnos visibles a CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter bar: Modalities & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Modality Selector tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            id="client-filter-all"
            onClick={() => setFilterModality('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterModality === 'all'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            id="client-filter-digital"
            onClick={() => setFilterModality('digital')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterModality === 'digital'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-500" />
            <span>Alumnos Digitales ({digitalCount})</span>
          </button>
          <button
            id="client-filter-colaborador"
            onClick={() => setFilterModality('colaborador')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterModality === 'colaborador'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Alumnos Colaboradores ({colabCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="search-clients-input"
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando alumnos...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No se encontraron alumnos para los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Alumno</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Modalidad de Uso</th>
                  <th className="p-3.5">Consumo Registrado</th>
                  <th className="p-3.5">Estado Cuenta</th>
                  <th className="p-3.5 text-right">Acción / Modalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((client) => {
                  const isColab = client.tipoAlumno === 'colaborador';
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white font-bold flex items-center justify-center text-xs uppercase shrink-0">
                            {client.nombreVisible.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {client.nombreVisible}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {client.nombre} {client.apellido}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono">
                        {client.email}
                      </td>

                      <td className="p-3.5">
                        {isColab ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                            <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />
                            <span>Alumno Colaborador</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-bold">
                            <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                            <span>Alumno Digital</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {isColab ? 'Compra física en mostrador' : 'Pedidos online habilitados'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(client.totalSpent || 0)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {client.orderCount || 0} compras
                        </span>
                      </td>

                      <td className="p-3.5">
                        {client.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            <Ban className="w-3 h-3" />
                            <span>Bloqueado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle className="w-3 h-3" />
                            <span>Activo</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Modality toggle button */}
                          <button
                            id={`toggle-modality-${client.id}`}
                            onClick={() => handleToggleModality(client)}
                            disabled={updatingId === client.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                              isColab
                                ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                                : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
                            }`}
                            title="Cambiar modalidad de uso escolar"
                          >
                            {updatingId === client.id
                              ? 'Cambiando...'
                              : isColab
                              ? 'Pasar a Digital'
                              : 'Pasar a Colaborador'}
                          </button>

                          {/* Block/unblock */}
                          <button
                            id={`toggle-block-${client.id}`}
                            onClick={() => handleToggleBlock(client)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              client.isBlocked
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950'
                            }`}
                            title={client.isBlocked ? 'Desbloquear alumno' : 'Suspender cuenta'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
