import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ProductDetailModal } from './ProductDetailModal';
import {
  Heart,
  ShoppingBag,
  CreditCard,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter,
  X,
  Search,
  Check,
  Store,
  ArrowRight,
  Sparkles,
  Percent,
  CupSoda,
  Cookie,
  Candy,
  Popcorn,
  Sandwich,
  Apple,
  PenTool,
  Tag,
  Layers,
  Flame,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ShopCatalogProps {
  searchQuery: string;
  setSearchQuery?: (q: string) => void;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({ searchQuery, setSearchQuery }) => {
  const { products, categories, addToCart, currentUser, toggleFavorite } = useApp();

  const [internalQuery, setInternalQuery] = useState('');
  const activeSearchQuery = setSearchQuery !== undefined ? searchQuery : internalQuery;

  const handleSearchChange = (val: string) => {
    if (setSearchQuery) {
      setSearchQuery(val);
    } else {
      setInternalQuery(val);
    }
  };

  const pillScrollRef = useRef<HTMLDivElement>(null);
  const scrollPills = (direction: 'left' | 'right') => {
    if (pillScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      pillScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Helper to map category icons dynamically
  const getCategoryIcon = (icono: string, categoryId: string) => {
    const id = categoryId.toLowerCase();
    if (id.includes('bebida') || icono === 'CupSoda') {
      return <CupSoda className="w-3.5 h-3.5 shrink-0" />;
    }
    if (id.includes('snack') || icono === 'Popcorn') {
      return <Popcorn className="w-3.5 h-3.5 shrink-0" />;
    }
    if (
      id.includes('libreria') ||
      id.includes('stationery') ||
      id.includes('util') ||
      id.includes('papel') ||
      icono === 'PenTool' ||
      icono === 'BookOpen'
    ) {
      return <PenTool className="w-3.5 h-3.5 shrink-0" />;
    }
    if (id.includes('alfajor') || icono === 'Cookie') {
      return <Cookie className="w-3.5 h-3.5 shrink-0" />;
    }
    if (id.includes('golosina') || icono === 'Candy') {
      return <Candy className="w-3.5 h-3.5 shrink-0" />;
    }
    if (id.includes('comida') || icono === 'Sandwich') {
      return <Sandwich className="w-3.5 h-3.5 shrink-0" />;
    }
    if (id.includes('salud') || icono === 'Apple') {
      return <Apple className="w-3.5 h-3.5 shrink-0" />;
    }
    return <Tag className="w-3.5 h-3.5 shrink-0" />;
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterPromoOnly, setFilterPromoOnly] = useState<boolean>(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [activeSlide, setActiveSlide] = useState(0);

  // Selected product for Mercado Libre Quick Detail Modal
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Active categories
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.activa);
  }, [categories]);

  // Compute category product counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.estado !== 'desactivado') {
        counts[p.categoriaId] = (counts[p.categoriaId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Handle price filter apply
  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedMinPrice(minPrice ? Number(minPrice) : null);
    setAppliedMaxPrice(maxPrice ? Number(maxPrice) : null);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setFilterPromoOnly(false);
    setFilterInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    handleSearchChange('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    filterPromoOnly ||
    filterInStockOnly ||
    appliedMinPrice !== null ||
    appliedMaxPrice !== null ||
    activeSearchQuery.trim() !== '';

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.estado !== 'desactivado');

    if (activeSearchQuery.trim()) {
      const q = activeSearchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const catName = categories.find((c) => c.id === p.categoriaId)?.nombre.toLowerCase() || '';
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          catName.includes(q)
        );
      });
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoriaId === selectedCategory);
    }

    if (filterPromoOnly) {
      list = list.filter((p) => p.enPromocion);
    }

    if (filterInStockOnly) {
      list = list.filter((p) => p.stock > 0 && p.estado !== 'agotado');
    }

    if (appliedMinPrice !== null) {
      list = list.filter((p) => {
        const effectivePrice = p.enPromocion && p.precioPromocional ? p.precioPromocional : p.precioVenta;
        return effectivePrice >= appliedMinPrice;
      });
    }

    if (appliedMaxPrice !== null) {
      list = list.filter((p) => {
        const effectivePrice = p.enPromocion && p.precioPromocional ? p.precioPromocional : p.precioVenta;
        return effectivePrice <= appliedMaxPrice;
      });
    }

    // Sorting
    return [...list].sort((a, b) => {
      const priceA = a.enPromocion && a.precioPromocional ? a.precioPromocional : a.precioVenta;
      const priceB = b.enPromocion && b.precioPromocional ? b.precioPromocional : b.precioVenta;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return a.nombre.localeCompare(b.nombre);
      // 'featured'
      if (a.destacado && !b.destacado) return -1;
      if (!a.destacado && b.destacado) return 1;
      return 0;
    });
  }, [products, categories, activeSearchQuery, selectedCategory, filterPromoOnly, filterInStockOnly, appliedMinPrice, appliedMaxPrice, sortBy]);

  // Promotional Banner Slides (Mercado Libre carousel style)
  const slides = [
    {
      id: 1,
      badge: 'RECREOS SIN FILAS',
      title: 'Pedí online y retirá sin esperar',
      subtitle: 'Hacé tu pedido antes de que suene el timbre y retirá directo por el mostrador exclusivo.',
      cta: 'Ver productos',
      action: () => setSelectedCategory('all'),
      bg: 'bg-slate-900 text-white',
      accentColor: 'text-amber-400',
    },
    {
      id: 2,
      badge: 'OFERTAS DE LA SEMANA',
      title: 'Combos de merienda y snacks con descuento',
      subtitle: 'Aprovechá hasta 15% OFF en alfajores triples, jugos naturales y sándwiches tostados.',
      cta: 'Ver ofertas',
      action: () => setFilterPromoOnly(true),
      bg: 'bg-amber-400 text-slate-950',
      accentColor: 'text-slate-900',
    },
  ];

  const currentSlide = slides[activeSlide];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Mercado Libre Style Banner Slider (Visible when not actively searching) */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
          <div className={`${currentSlide.bg} p-6 sm:p-8 transition-colors duration-300 relative`}>
            <div className="max-w-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20 text-white">
                {currentSlide.badge}
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {currentSlide.title}
              </h2>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-lg">
                {currentSlide.subtitle}
              </p>
              <div className="pt-2">
                <button
                  onClick={currentSlide.action}
                  className="px-4 py-2 bg-white text-slate-950 font-bold text-xs rounded-md shadow-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {currentSlide.cta}
                </button>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx ? 'w-5 bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Mercado Libre Style Trust Strip (4 Key Value Props) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Elegí cómo pagar
            </span>
            <span className="text-[11px] text-slate-400">Efectivo o Mercado Pago</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Retiro en el recreo
            </span>
            <span className="text-[11px] text-slate-400">Sin filas en mostrador</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Compra protegida
            </span>
            <span className="text-[11px] text-slate-400">Comprobante escolar digital</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Precios regulados
            </span>
            <span className="text-[11px] text-slate-400">Tarifas oficiales escolares</span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Pill-Shaped Category Filters (Quick refinement by Drinks, Snacks, Stationery, etc.) */}
      <div
        id="shop-search-refinement-section"
        className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5"
      >
        {/* Search Bar Input */}
        <div className="relative w-full">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-amber-500" />
            </div>
            <input
              id="shop-catalog-search-input"
              type="text"
              placeholder="Buscar bebidas, snacks, librería, alfajores o marcas..."
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
            />
            {activeSearchQuery && (
              <button
                id="clear-catalog-search-btn"
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                aria-label="Borrar texto de búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pill-shaped Category Filters below the search bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Filtrar por categoría rápida:
            </span>
            {hasActiveFilters && (
              <button
                id="clear-all-catalog-filters-btn"
                onClick={handleClearFilters}
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <X className="w-3 h-3" />
                <span>Restablecer todo</span>
              </button>
            )}
          </div>

          {/* Scrollable pill container with navigation arrows */}
          <div className="relative flex items-center">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={() => scrollPills('left')}
              className="hidden sm:flex shrink-0 items-center justify-center w-7 h-7 mr-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs cursor-pointer transition-colors"
              aria-label="Desplazar categorías hacia la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              id="category-pill-filters-bar"
              ref={pillScrollRef}
              className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none scroll-smooth flex-1"
            >
              {/* "Todas" Pill */}
              <button
                id="filter-pill-all"
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400/30'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todas</span>
                <span className="text-[10px] opacity-75">
                  ({products.filter((p) => p.estado !== 'desactivado').length})
                </span>
              </button>

              {/* Dynamic Categories: Drinks (Bebidas), Snacks (Snacks), Stationery (Librería), Alfajores, etc. */}
              {activeCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    id={`filter-pill-${cat.id}`}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {getCategoryIcon(cat.icono, cat.id)}
                    <span>{cat.nombre}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}

              {/* Promo Filter Pill */}
              <button
                id="filter-pill-promo"
                onClick={() => setFilterPromoOnly(!filterPromoOnly)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  filterPromoOnly
                    ? 'bg-rose-500 text-white font-bold shadow-xs ring-2 ring-rose-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Ofertas</span>
              </button>

              {/* In-Stock Filter Pill */}
              <button
                id="filter-pill-instock"
                onClick={() => setFilterInStockOnly(!filterInStockOnly)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  filterInStockOnly
                    ? 'bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-600/30'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Solo en stock</span>
              </button>
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={() => scrollPills('right')}
              className="hidden sm:flex shrink-0 items-center justify-center w-7 h-7 ml-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs cursor-pointer transition-colors"
              aria-label="Desplazar categorías hacia la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Catalog Area (Mercado Libre 2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {/* Active Filter Clear */}
          {hasActiveFilters && (
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Filtros aplicados</span>
              <button
                onClick={handleClearFilters}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            </div>
          )}

          {/* Categories List */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2.5">
              Categorías
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Todas las categorías</span>
                  <span className="text-[11px] text-slate-400">({products.length})</span>
                </button>
              </li>
              {activeCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cat.nombre}</span>
                    <span className="text-[11px] text-slate-400">
                      ({categoryCounts[cat.id] || 0})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Filters */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              Condición y Ofertas
            </h3>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterPromoOnly}
                onChange={(e) => setFilterPromoOnly(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Con descuento / Promociones</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterInStockOnly}
                onChange={(e) => setFilterInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Solo productos con stock disponible</span>
            </label>
          </div>

          {/* Price Range Filter (Mercado Libre style) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2.5">
              Precio
            </h3>
            <form onSubmit={handleApplyPriceFilter} className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Mínimo"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Máximo"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
                aria-label="Aplicar filtro de precio"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </aside>

        {/* Right Column: Products Catalog Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Bar: Results count, active filters tags, Sort select */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </span>
              {activeSearchQuery && (
                <span className="text-slate-500">
                  para "<strong>{activeSearchQuery}</strong>"
                </span>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-500">Ordenar por:</span>
              <div className="relative">
                <select
                  id="sort-products-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-2.5 pr-7 py-1 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="featured">Más relevantes</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="name">Nombre (A-Z)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Cards Grid (Mercado Libre Style) */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No hay publicaciones que coincidan con tu búsqueda
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Revisá la ortografía de la palabra o intentá con términos más generales.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0 || product.estado === 'agotado';
                const hasPromo = Boolean(product.enPromocion && product.precioPromocional);
                const currentPrice = hasPromo ? product.precioPromocional! : product.precioVenta;
                const isFavorite = currentUser?.favorites?.includes(product.id);
                const isColaborador = currentUser?.tipoAlumno === 'colaborador';

                const discountPercent = hasPromo
                  ? Math.round(((product.precioVenta - product.precioPromocional!) / product.precioVenta) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 hover:shadow-lg transition-all duration-150 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Favorite heart on top-right */}
                    <button
                      id={`fav-btn-${product.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                      aria-label="Favorito"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Image Area - clickable to open detail modal */}
                    <div
                      onClick={() => setDetailProduct(product)}
                      className="aspect-square w-full bg-white dark:bg-slate-800 p-3 flex items-center justify-center cursor-pointer relative overflow-hidden"
                    >
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className={`max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105 ${
                          isOutOfStock ? 'opacity-40 grayscale' : ''
                        }`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-1 rounded">
                            Sin stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Body (Mercado Libre Style) */}
                    <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between border-t border-slate-100 dark:border-slate-800/80">
                      <div
                        onClick={() => setDetailProduct(product)}
                        className="cursor-pointer space-y-1"
                      >
                        {/* Strikethrough price if promo */}
                        {hasPromo && (
                          <div className="text-[11px] text-slate-400 line-through">
                            {formatCurrency(product.precioVenta)}
                          </div>
                        )}

                        {/* Large Price + Discount tag */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {formatCurrency(currentPrice)}
                          </span>
                          {hasPromo && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {/* Pickup badge in green (ML signature) */}
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ⚡ Retiro en el próximo recreo
                        </div>

                        {/* Brand & Title */}
                        <div className="pt-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            {product.marca}
                          </span>
                          <h4 className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-2 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                            {product.nombre}
                          </h4>
                        </div>
                      </div>

                      {/* Direct Add Button */}
                      <div className="mt-3 pt-2">
                        {!isOutOfStock ? (
                          !isColaborador ? (
                            <button
                              id={`quick-add-btn-${product.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                              className="w-full py-1.5 px-3 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-600 text-sky-700 dark:text-sky-300 hover:text-white border border-sky-200 dark:border-sky-800 hover:border-transparent text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Agregar</span>
                            </button>
                          ) : (
                            <div className="text-center py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                              Compra en mostrador
                            </div>
                          )
                        ) : (
                          <div className="text-center py-1 text-[11px] text-slate-400">
                            Agotado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mercado Libre Style Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
      />
    </div>
  );
};
