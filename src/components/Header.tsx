import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, Store, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-2' : 'bg-white shadow-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-gray-900 group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Store className="w-6 h-6 text-primary" />
            </span>
            <span className="text-xl font-bold tracking-tight">BUS STORE</span>
          </NavLink>

          <nav className="flex items-center gap-6">
            <NavLink
              to="/track-order"
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-3 py-2 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isActive ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                ].join(' ')
              }
              aria-label="Suivre ma commande"
            >
              <Package className="w-5 h-5 md:hidden" />
              <span className="hidden md:inline">Suivre ma commande</span>
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                [
                  'relative inline-flex items-center justify-center rounded-xl p-2 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isActive ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                ].join(' ')
              }
              aria-label="Voir le panier"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow border-2 border-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
