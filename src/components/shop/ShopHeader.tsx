import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Sun,
  Moon,
  Clock,
  LogOut,
  Shield,
  Menu,
  X,
  Store,
  ShieldCheck,
  Bell,
  MapPin,
  ChevronDown,
  Tag,
  BadgeCheck,
} from 'lucide-react';

interface ShopHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const {
    currentUser,
    activeShopTab,
    setActiveShopTab,
    cart,
    setCartOpen,
    setAuthModalOpen,
    setAuthModalTab,
    logout,
    theme,
    toggleTheme,
    setUserExperience,
    settings,
    setPrivacyModalOpen,
    setNotificationsOpen,
    unreadNotificationsCount,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isColaborador = currentUser?.tipoAlumno === 'colaborador';

  return (
    <header
      id="shop-header"
      className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
    >
      {/* Mercado Libre Style Top Announcement Bar */}
      <div className="bg-amber-400 dark:bg-amber-500 text-slate-950 text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold tracking-tight">Kios Mercado</span>
            <span className="hidden sm:inline text-slate-800">·</span>
            <span className="hidden sm:inline font-normal text-slate-900 truncate">
              Pedí online con retiro sin filas en el próximo recreo
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compra protegida</span>
            </button>
            <span>·</span>
            <button
              onClick={toggleTheme}
              className="hover:opacity-80 transition-opacity cursor-pointer p-0.5"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <button
            id="brand-home-btn"
            onClick={() => setActiveShopTab('catalog')}
            className="flex items-center gap-2 text-left shrink-0 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-md bg-amber-400 dark:bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                Kios Mercado
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                {settings?.nombreKiosco || 'kiosControl'}
              </span>
            </div>
          </button>

          {/* Central Mercado Libre Search Box */}
          <div className="flex-1 max-w-2xl mx-1 sm:mx-2">
            <div className="relative w-full">
              <input
                id="shop-search-input"
                type="text"
                placeholder="Buscar productos, marcas, bebidas, alfajores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-inner focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
                {searchQuery ? (
                  <button
                    id="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="p-1.5 text-slate-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons & User Account */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* If Admin logged in, quick switch button */}
            {currentUser?.role === 'admin' && (
              <button
                id="header-goto-admin-btn"
                onClick={() => setUserExperience('admin')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                title="Ir al panel de administración"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Panel Admin</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              id="shop-notifications-bell-btn"
              onClick={() => setNotificationsOpen(true)}
              aria-label="Notificaciones"
              title="Notificaciones del kiosco"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Mis Favoritos (Desktop) */}
            {!isColaborador && (
              <button
                id="nav-favorites-btn"
                onClick={() => {
                  if (!currentUser) setAuthModalOpen(true);
                  else setActiveShopTab('favorites');
                }}
                className={`hidden md:flex p-2 rounded-md transition-colors relative cursor-pointer ${
                  activeShopTab === 'favorites'
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Mis Favoritos"
                aria-label="Mis Favoritos"
              >
                <Heart className={`w-5 h-5 ${currentUser?.favorites?.length ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}

            {/* Mis Compras / Pedidos (Desktop) */}
            {!isColaborador && (
              <button
                id="nav-orders-btn"
                onClick={() => {
                  if (!currentUser) setAuthModalOpen(true);
                  else setActiveShopTab('orders');
                }}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeShopTab === 'orders'
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Mis compras</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            {!isColaborador ? (
              <button
                id="open-cart-btn"
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-md transition-all cursor-pointer shadow-xs"
                title="Abrir Carrito"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Carrito</span>
                {totalCartItems > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                    {totalCartItems}
                  </span>
                )}
              </button>
            ) : (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-md text-teal-800 dark:text-teal-300 text-xs font-bold"
                title="Estás en modalidad de compra presencial en mostrador"
              >
                <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Compra Presencial</span>
              </div>
            )}

            {/* User Account / Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="nav-profile-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 pl-1.5 py-1 text-left rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Cuenta de usuario"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase border border-slate-300 dark:border-slate-600">
                    {currentUser.nombreVisible.charAt(0)}
                  </div>
                  <div className="hidden xl:block">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate max-w-[100px]">
                      {currentUser.nombreVisible}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Mi perfil</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.nombreVisible}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500">
                        {isColaborador ? 'Alumno Colaborador (Presencial)' : 'Alumno Digital'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveShopTab('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mis datos personales</span>
                    </button>

                    {!isColaborador && (
                      <button
                        onClick={() => {
                          setActiveShopTab('orders');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Historial de compras</span>
                      </button>
                    )}

                    {!isColaborador && (
                      <button
                        onClick={() => {
                          setActiveShopTab('favorites');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 text-slate-400" />
                        <span>Productos favoritos</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => {
                  setAuthModalTab('login');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Ingresá</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-md"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sub-bar: Mercado Libre Style Location & Quick Category Navigation */}
        <div className="hidden md:flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold">Retiro:</span>
            <span>Kiosco Central del Colegio (Recreos y Mostrador)</span>
          </div>

          <nav className="flex items-center gap-5 font-medium">
            <button
              onClick={() => setActiveShopTab('catalog')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeShopTab === 'catalog' ? 'text-amber-600 dark:text-amber-400 font-bold' : ''
              }`}
            >
              Catálogo completo
            </button>
            {!isColaborador && (
              <button
                onClick={() => {
                  if (!currentUser) setAuthModalOpen(true);
                  else setActiveShopTab('orders');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Mis compras
              </button>
            )}
            {!isColaborador && (
              <button
                onClick={() => {
                  if (!currentUser) setAuthModalOpen(true);
                  else setActiveShopTab('favorites');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Favoritos
              </button>
            )}
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Ayuda y Privacidad
            </button>
          </nav>
        </div>

        {/* Mobile Expanded Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Retiro en Kiosco Escolar</span>
            </div>

            <button
              onClick={() => {
                setActiveShopTab('catalog');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Catálogo de Productos
            </button>

            {!isColaborador && (
              <button
                onClick={() => {
                  if (!currentUser) setAuthModalOpen(true);
                  else setActiveShopTab('orders');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Mis Compras / Pedidos
              </button>
            )}

            {!isColaborador && (
              <button
                onClick={() => {
                  if (!currentUser) setAuthModalOpen(true);
                  else setActiveShopTab('favorites');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Favoritos
              </button>
            )}

            <button
              onClick={() => {
                setActiveShopTab('profile');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Mi Perfil
            </button>

            <button
              onClick={() => {
                setPrivacyModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-slate-600 dark:text-slate-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Política de Privacidad</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setUserExperience('admin');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-left font-bold text-amber-600 dark:text-amber-400 rounded hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Cambiar a Panel kiosControl</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
