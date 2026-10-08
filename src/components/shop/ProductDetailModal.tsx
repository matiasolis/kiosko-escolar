import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  X,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Clock,
  ShieldCheck,
  Star,
  Check,
  AlertTriangle,
  Store,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setCartOpen, setCheckoutOpen, currentUser, toggleFavorite, addToast } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0 || product.estado === 'agotado';
  const isLowStock = !isOutOfStock && (product.stock <= product.stockMinimo || product.estado === 'stock_bajo');
  const hasPromo = Boolean(product.enPromocion && product.precioPromocional);
  const currentPrice = hasPromo ? product.precioPromocional! : product.precioVenta;
  const isFavorite = currentUser?.favorites?.includes(product.id);
  const isColaborador = currentUser?.tipoAlumno === 'colaborador';

  const discountPercent = hasPromo
    ? Math.round(((product.precioVenta - product.precioPromocional!) / product.precioVenta) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (isColaborador) {
      addToast(
        'info',
        'Modalidad Alumno Colaborador',
        'Tu cuenta es presencial. Podés pedir este producto en el mostrador del kiosco.'
      );
      return;
    }
    addToCart(product, quantity);
    onClose();
    setCheckoutOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    addToast('success', 'Enlace copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div
        id="product-detail-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        >
          {/* Close button */}
          <button
            id="close-product-detail-modal"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Product Image Stage */}
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
              <div className="w-full aspect-square max-w-[320px] rounded-lg bg-white dark:bg-slate-800 overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center relative">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-4"
                />

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-4 py-2 bg-rose-600 text-white text-xs font-bold uppercase rounded-md shadow-md">
                      Sin Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Trust markers under image */}
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isFavorite ? 'En tus favoritos' : 'Agregar a favoritos'}</span>
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-sky-600 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'Copiado' : 'Compartir'}</span>
                </button>
              </div>
            </div>

            {/* Right: Product Purchase Module (Mercado Libre style) */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div>
                {/* Meta line */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="font-semibold uppercase tracking-wider">{product.marca}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{product.categoriaId}</span>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="ml-1 text-slate-700 dark:text-slate-300 font-bold">4.9</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                  {product.nombre}
                </h1>

                {/* Pricing Block */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {hasPromo && (
                    <div className="text-sm text-slate-400 line-through">
                      {formatCurrency(product.precioVenta)}
                    </div>
                  )}

                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(currentPrice)}
                    </span>

                    {hasPromo && (
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Payment notice */}
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                    <span>Pagá con Mercado Pago o Efectivo al retirar</span>
                  </div>
                </div>

                {/* Pickup badge */}
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Retiro GRATIS en el próximo recreo</span>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Mostrador de Kios Mercado escolar. Tu pedido te espera listo y embolsado.
                    </p>
                  </div>
                </div>

                {/* Stock info */}
                <div className="mt-4 text-xs">
                  {isOutOfStock ? (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Producto agotado temporalmente
                    </span>
                  ) : (
                    <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>
                        Stock disponible:{' '}
                        <strong className="text-slate-900 dark:text-white">{product.stock} unidades</strong>
                      </span>
                      {isLowStock && (
                        <span className="text-amber-600 font-semibold">¡Últimas unidades!</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity selector */}
                {!isOutOfStock && !isColaborador && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Cantidad:
                    </span>
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 p-0.5">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-30 cursor-pointer"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-30 cursor-pointer"
                        aria-label="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      (máx. {product.stock})
                    </span>
                  </div>
                )}

                {/* Description */}
                {product.descripcion && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Descripción
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {product.descripcion}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!isOutOfStock ? (
                  !isColaborador ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        id="buy-now-modal-btn"
                        onClick={handleBuyNow}
                        className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Comprar ahora</span>
                      </button>
                      <button
                        id="add-to-cart-modal-btn"
                        onClick={handleAddToCart}
                        className="w-full py-2.5 px-4 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 active:scale-98 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Agregar al carrito</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-lg text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
                      <Store className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Modalidad Alumno Colaborador: Podés pedir este snack directamente en el mostrador del kiosco.</span>
                    </div>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed"
                  >
                    Agotado por el momento
                  </button>
                )}

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Compra Escolar Protegida con Comprobante Digital</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
