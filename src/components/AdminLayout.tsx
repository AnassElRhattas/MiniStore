import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { ordersService } from '../services/orders';
import { Order } from '../types';
import { Link } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Order[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to orders to get real-time updates
    const unsubscribe = ordersService.subscribeToOrders((allOrders) => {
      // Filter for pending orders (or "new" orders logic)
      // For now, let's show all pending orders as notifications
      const pendingOrders = allOrders.filter(order => order.status === 'pending');
      setNotifications(pendingOrders);
    });

    return () => unsubscribe();
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        {/* Top Header */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-semibold text-gray-900 md:hidden">Admin Dashboard</span>
              {/* Desktop Title (Optional, sidebar has branding) */}
            </div>

            <div className="flex items-center gap-4" ref={notificationRef}>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <span className="text-xs text-gray-500">{notifications.length} Pending</span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          No new orders
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(order => (
                          <Link 
                            key={order.id}
                            to="/admin/orders" 
                            onClick={() => setShowNotifications(false)}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-900 text-sm">New Order</span>
                              <span className="text-xs text-gray-500">
                                {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {order.client.name} - {order.total.toLocaleString()} DH
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                              <span className="text-xs text-gray-400">#{order.id.slice(0, 6)}</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100 text-center">
                        <Link 
                          to="/admin/orders" 
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View all orders
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
