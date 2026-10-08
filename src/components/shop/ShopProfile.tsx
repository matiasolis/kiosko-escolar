import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, maskEmail } from '../../utils/formatters';
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  Heart,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
  BadgeCheck,
  Smartphone,
  Store,
  Sparkles,
} from 'lucide-react';

export const ShopProfile: React.FC = () => {
  const { currentUser, token, logout, addToast, refreshAllData, setPrivacyModalOpen } = useApp();

  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [apellido, setApellido] = useState(currentUser?.apellido || '');
  const [nombreVisible, setNombreVisible] = useState(currentUser?.nombreVisible || '');
  const [showFullEmail, setShowFullEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, apellido, nombreVisible }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Error al actualizar perfil.' });
        return;
      }

      setMsg({ type: 'success', text: 'Tus datos fueron actualizados correctamente.' });
      addToast('success', 'Perfil actualizado', 'Datos personales guardados.');
      refreshAllData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-sky-500/10">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-3xl uppercase border-2 border-white/40 shadow-inner shrink-0">
          {currentUser.nombreVisible.charAt(0)}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-1.5">
            Cuenta de Alumno
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{currentUser.nombreVisible}</h1>
          <div className="flex items-center gap-2 mt-1 text-sky-100 text-xs flex-wrap justify-center sm:justify-start">
            <span>{currentUser.nombre} {currentUser.apellido}</span>
            <span>•</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span>{showFullEmail ? currentUser.email : maskEmail(currentUser.email)}</span>
              <button
                type="button"
                onClick={() => setShowFullEmail(!showFullEmail)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                title={showFullEmail ? 'Ocultar correo' : 'Mostrar correo completo'}
              >
                {showFullEmail ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </span>
          </div>
        </div>

        <button
          id="profile-logout-btn"
          onClick={logout}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Total Gastado</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(currentUser.totalSpent || 0)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Histórico en Kios Mercado</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Pedidos Realizados</span>
            <ShoppingBag className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currentUser.orderCount || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Compras confirmadas</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Favoritos Guardados</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currentUser.favorites?.length || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Snacks y bebidas preferidas</span>
        </div>
      </div>

      {/* Modality Card (Alumno Digital vs Alumno Colaborador) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all ${
          currentUser.tipoAlumno === 'colaborador'
            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border-teal-200 dark:border-teal-800'
            : 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30 border-sky-200 dark:border-sky-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-2xl text-white shrink-0 shadow-md ${
                currentUser.tipoAlumno === 'colaborador'
                  ? 'bg-teal-600 shadow-teal-600/20'
                  : 'bg-sky-600 shadow-sky-600/20'
              }`}
            >
              {currentUser.tipoAlumno === 'colaborador' ? (
                <BadgeCheck className="w-6 h-6" />
              ) : (
                <Smartphone className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    currentUser.tipoAlumno === 'colaborador'
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200'
                  }`}
                >
                  Modalidad de Uso
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentUser.tipoAlumno === 'colaborador'
                  ? 'Alumno Colaborador (Presencial)'
                  : 'Alumno Digital (Pedidos Online)'}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {currentUser.tipoAlumno === 'colaborador'
                  ? 'Esta modalidad representa a los alumnos de la institución que realizan sus compras directamente en el mostrador físico del kiosco escolar. Podés consultar el catálogo actualizado con precios en tiempo real, visualizar avisos y promociones institucionales y recibir notificaciones oficiales del colegio.'
                  : 'Esta modalidad te permite realizar compras anticipadas en línea, programar el retiro de tus snacks en los recreos seleccionados, armar tu carrito siempre visible y guardar tus productos favoritos.'}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {currentUser.tipoAlumno === 'colaborador' ? (
                  <>
                    <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
                      <Store className="w-3.5 h-3.5 text-teal-600" />
                      <span>Compra física presencial en mostrador</span>
                    </span>
                    <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Acceso a promociones y avisos</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
                      <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                      <span>Pedidos online y retiro en recreos</span>
                    </span>
                    <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
                      <Heart className="w-3.5 h-3.5 text-sky-600" />
                      <span>Favoritos y carrito dinámico</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Data Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Datos Personales
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Podés actualizar tu nombre visible para que el personal de Kios Mercado te identifique fácilmente al retirar.
        </p>

        {msg && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre
              </label>
              <input
                id="profile-nombre-input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apellido
              </label>
              <input
                id="profile-apellido-input"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nombre Visible / Apodo
              </label>
              <span className="text-[10px] text-slate-400">Solo letras y espacios, sin números</span>
            </div>
            <input
              id="profile-nombre-visible-input"
              type="text"
              value={nombreVisible}
              onChange={(e) => setNombreVisible(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Correo Electrónico (Identificador Escolar)
              </label>
              <button
                type="button"
                onClick={() => setShowFullEmail(!showFullEmail)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {showFullEmail ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showFullEmail ? 'Ocultar correo' : 'Revelar correo'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                id="profile-email-display"
                type="text"
                readOnly
                value={showFullEmail ? currentUser.email : maskEmail(currentUser.email)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Privacidad garantizada: Tu correo solo es visible para vos y para la administración del kiosco.</span>
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Privacy Policy Callout Card */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Política de Privacidad y Protección de Datos
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Conocé cómo protegemos tu información escolar, tus pedidos y la confidencialidad de tu cuenta.
            </p>
          </div>
        </div>
        <button
          id="open-privacy-policy-profile-btn"
          type="button"
          onClick={() => setPrivacyModalOpen(true)}
          className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          Ver Política Completa
        </button>
      </div>
    </div>
  );
};
