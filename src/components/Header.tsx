import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Store } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { authService } from '../services/auth';

export const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      authService.checkAdminStatus(user.uid).then(setIsAdmin);
    }

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        const adminStatus = await authService.checkAdminStatus(user.uid);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, []);

  const totalItems = getTotalItems();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-gray-900">
            <Store className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">Mini Store</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            
            {!isAdmin ? (
              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  <User className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
