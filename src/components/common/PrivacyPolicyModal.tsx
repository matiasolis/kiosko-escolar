import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  FileText,
  UserCheck,
  Database,
  X,
  CheckCircle2,
  HelpCircle,
  School,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PrivacyPolicyModal: React.FC = () => {
  const { privacyModalOpen, setPrivacyModalOpen, settings } = useApp();

  if (!privacyModalOpen) return null;

  return (
    <div
      id="privacy-policy-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={() => setPrivacyModalOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 px-6 py-5 text-white relative flex-shrink-0">
          <button
            id="close-privacy-modal-btn"
            onClick={() => setPrivacyModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            title="Cerrar política de privacidad"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-white/20 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protección de Datos Escolares
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Política de Privacidad y Uso de Datos
          </h2>
          <p className="text-xs text-sky-100 mt-1 max-w-lg">
            {settings?.nombreKiosco || 'kiosControl'} • Kios Mercado — Transparencia, seguridad y protección para alumnos y familias.
          </p>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {/* Summary Callout */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex items-start gap-3">
            <School className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 dark:text-sky-200 space-y-1">
              <p className="font-bold">Resumen de Confianza Escolar:</p>
              <p>
                Tus datos son utilizados <strong>exclusivamente para gestionar tus pedidos del recreo</strong>. 
                Los correos electrónicos <strong>nunca son expuestos a otros alumnos ni en pantallas públicas</strong>, 
                y las contraseñas se almacenan con cifrado de alta seguridad.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-500" />
              1. ¿Qué datos recolectamos y por qué?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Para garantizar que tus compras se preparen a tiempo y se entreguen correctamente, solicitamos únicamente los datos indispensables:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block mb-0.5">Nombre y Apellido:</strong>
                Para tu legajo o identificación en la institución educativa.
              </li>
              <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block mb-0.5">Nombre Visible de Alumno:</strong>
                El apodo o nombre corto respetuoso con el que te llamarán en el mostrador para retirar.
              </li>
              <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block mb-0.5">Correo Electrónico Verificado:</strong>
                Identificador único de cuenta, recuperación de contraseña y envío de recibos digitales.
              </li>
              <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block mb-0.5">Historial de Pedidos:</strong>
                Detalle de productos comprados, recreo de retiro y método de pago registrado.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-500" />
              2. Confidencialidad y no exposición pública de correos
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Siguiendo las mejores prácticas de privacidad y protección al menor:
            </p>
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Privacidad estricta en el mostrador escolar</span>
              </div>
              <p>
                Los correos electrónicos completos <strong>no aparecen en la tienda online pública</strong>, ni en los comprobantes de mostrador, ni pueden ser vistos por otros alumnos. 
                Solo el <strong>Administrador del kiosco</strong> tiene acceso al correo completo dentro de la consola protegida para contactar al alumno o tutor en caso de extravío o consulta.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-500" />
              3. Tokens de Sesión (JWT) y Seguridad Criptográfica
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Implementamos múltiples capas de protección técnica:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Tokens de Sesión JWT:</strong> La autenticación utiliza tokens criptográficos firmados digitalmente (JSON Web Tokens) que verifican tu identidad en cada petición sin exponer credenciales.
              </li>
              <li>
                <strong>Contraseñas con Hashing Seguro (bcrypt):</strong> Las contraseñas nunca se guardan en texto plano; son procesadas con algoritmos de hashing unidireccional con sal aleatoria.
              </li>
              <li>
                <strong>Base de datos relacional Cloud SQL:</strong> Toda la información reside en una base de datos PostgreSQL protegida en Google Cloud, con control estricto de roles.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              4. Pagos y Datos Financieros
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              El sistema <strong>no almacena datos de tarjetas de crédito ni claves bancarias</strong>. Los pagos digitales se efectúan directamente a través de Mercado Pago (mediante código QR oficial o Alias de la Cooperadora Escolar), y en el sistema solo se conserva el número de comprobante para verificar la acreditación.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              5. Derechos de Acceso, Rectificación y Cancelación (ARCO)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              En cualquier momento podés actualizar tus datos personales desde la pestaña <strong>"Mi Perfil"</strong>. 
              Si deseás cancelar o dar de baja tu cuenta escolar definitivamente, podés solicitarlo de forma presencial al personal del kiosco o mediante secretaría escolar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            Última actualización: Septiembre 2026
          </span>
          <button
            id="accept-privacy-policy-btn"
            onClick={() => setPrivacyModalOpen(false)}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Entendido y Aceptado
          </button>
        </div>
      </motion.div>
    </div>
  );
};
