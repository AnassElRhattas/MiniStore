import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, Store, X } from 'lucide-react';
import { authService } from '../services/auth';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30
        w-64 bg-slate-900 min-h-screen flex flex-col text-white border-r border-slate-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 shadow flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <Store className="w-6 h-6 text-white" />
              <span className="text-white">Mini Store</span>
            </div>
            <p className="text-white/80 text-xs mt-1">Admin Panel</p>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin/orders"
            onClick={() => onClose()}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive('/admin/orders')
                ? 'bg-white/5 text-white border-l-2 border-blue-500'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
            aria-current={isActive('/admin/orders') ? 'page' : undefined}
          >
            <LayoutDashboard className="w-5 h-5" />
            Orders
          </Link>

          <Link
            to="/admin/products"
            onClick={() => onClose()}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive('/admin/products')
                ? 'bg-white/5 text-white border-l-2 border-blue-500'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
            aria-current={isActive('/admin/products') ? 'page' : undefined}
          >
            <Package className="w-5 h-5" />
            Products
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors mb-2"
          >
            <Store className="w-5 h-5" />
            View Store
          </Link>
          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
