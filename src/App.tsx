/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ShopHeader } from './components/shop/ShopHeader';
import { ShopCatalog } from './components/shop/ShopCatalog';
import { CartDrawer } from './components/shop/CartDrawer';
import { CheckoutModal } from './components/shop/CheckoutModal';
import { OrderSuccessModal } from './components/shop/OrderSuccessModal';
import { DigitalVoucherModal } from './components/shop/DigitalVoucherModal';
import { ShopOrders } from './components/shop/ShopOrders';
import { ShopFavorites } from './components/shop/ShopFavorites';
import { ShopProfile } from './components/shop/ShopProfile';

import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminStock } from './components/admin/AdminStock';
import { AdminCashRegister } from './components/admin/AdminCashRegister';
import { AdminFinances } from './components/admin/AdminFinances';
import { AdminStatistics } from './components/admin/AdminStatistics';
import { AdminSuppliers } from './components/admin/AdminSuppliers';
import { AdminPurchases } from './components/admin/AdminPurchases';
import { AdminClients } from './components/admin/AdminClients';
import { AdminNotifications } from './components/admin/AdminNotifications';
import { AdminActivity } from './components/admin/AdminActivity';
import { AdminSettings } from './components/admin/AdminSettings';
import { ExcelImportModal } from './components/admin/ExcelImportModal';

import { AuthModal } from './components/auth/AuthModal';
import { PrivacyPolicyModal } from './components/common/PrivacyPolicyModal';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import { ToastContainer } from './components/ui/Toast';
import { ShoppingBag } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    userExperience,
    activeShopTab,
    activeAdminTab,
    setPrivacyModalOpen,
    cart,
    setCartOpen,
    currentUser,
  } = useApp();
  const [shopSearchQuery, setShopSearchQuery] = useState('');

  // Admin layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isColaborador = currentUser?.tipoAlumno === 'colaborador';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* ========================================================= */}
      {/* 1. STUDENT / CLIENT SHOP EXPERIENCE                      */}
      {/* ========================================================= */}
      {userExperience === 'shop' && (
        <div className="flex flex-col min-h-screen relative">
          <ShopHeader searchQuery={shopSearchQuery} setSearchQuery={setShopSearchQuery} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {activeShopTab === 'catalog' && (
              <ShopCatalog searchQuery={shopSearchQuery} setSearchQuery={setShopSearchQuery} />
            )}
            {activeShopTab === 'orders' && <ShopOrders />}
            {activeShopTab === 'favorites' && <ShopFavorites />}
            {activeShopTab === 'profile' && <ShopProfile />}
          </main>

          {/* Floating Mobile Cart Button for immediate access on mobile */}
          {!isColaborador && (
            <div className="fixed bottom-6 right-5 z-40 sm:hidden">
              <button
                id="floating-mobile-cart-btn"
                onClick={() => setCartOpen(true)}
                className="relative flex items-center justify-center w-14 h-14 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-full shadow-xl shadow-sky-600/40 transition-all cursor-pointer"
                aria-label="Abrir Carrito"
              >
                <ShoppingBag className="w-6 h-6" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Student Footer */}
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto px-4 space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Kios Mercado • Sistema de Compra Online impulsado por kiosControl
              </p>
              <p className="text-[11px]">
                Pedidos en tiempo real con retiro en recreos y control integral de stock.
              </p>
              <div className="pt-1">
                <button
                  id="footer-privacy-policy-btn"
                  type="button"
                  onClick={() => setPrivacyModalOpen(true)}
                  className="text-[11px] text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
                >
                  🔒 Política de Privacidad y Tratamiento de Datos Escolares
                </button>
              </div>
            </div>
          </footer>

          {/* Student Experience Drawers & Modals */}
          <CartDrawer />
          <CheckoutModal />
          <OrderSuccessModal />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADMINISTRATOR / KIOSK OPERATOR EXPERIENCE             */}
      {/* ========================================================= */}
      {userExperience === 'admin' && (
        <div className="flex min-h-screen">
          <AdminSidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            mobileOpen={adminMobileOpen}
            setMobileOpen={setAdminMobileOpen}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader setMobileOpen={setAdminMobileOpen} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {activeAdminTab === 'dashboard' && <AdminDashboard />}
              {activeAdminTab === 'orders' && <AdminOrders />}
              {activeAdminTab === 'products' && <AdminProducts />}
              {activeAdminTab === 'stock' && <AdminStock />}
              {activeAdminTab === 'cash' && <AdminCashRegister />}
              {activeAdminTab === 'finances' && <AdminFinances />}
              {activeAdminTab === 'clients' && <AdminClients />}
              {activeAdminTab === 'notifications' && <AdminNotifications />}
              {activeAdminTab === 'statistics' && <AdminStatistics />}
              {activeAdminTab === 'suppliers' && <AdminSuppliers />}
              {activeAdminTab === 'purchases' && <AdminPurchases />}
              {activeAdminTab === 'activity' && <AdminActivity />}
              {activeAdminTab === 'settings' && <AdminSettings />}
            </main>
          </div>
        </div>
      )}

      {/* Shared Modals & Drawers across all roles */}
      <NotificationsDrawer />
      <ExcelImportModal />
      <DigitalVoucherModal />
      <AuthModal />
      <PrivacyPolicyModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
