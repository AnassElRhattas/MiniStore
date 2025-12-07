import React, { useState, useEffect } from 'react';
import { ordersService } from '../services/orders';
import { AdminOrderRow } from '../components/AdminOrderRow';
import { Order, OrderStatus } from '../types';
import { RefreshCcw, Filter, Package, Clock, CheckCircle, Truck, Loader, CreditCard, Box } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await ordersService.getAllOrders();
      setOrders(ordersData);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      // Revert the change in UI if update fails
      fetchOrders();
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    done: orders.filter(o => o.status === 'done').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'paid': return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'preparing': return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'done': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Box className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>
        
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                statusFilter === status 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
              }`}
              onClick={() => setStatusFilter(status as OrderStatus)}
            >
              <div className="flex justify-between items-start mb-2">
                {getStatusIcon(status)}
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
              <div className="text-sm text-gray-500 capitalize font-medium">{status}</div>
            </div>
          ))}
          <div
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
              statusFilter === 'all' 
                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="flex justify-between items-start mb-2">
              <Box className="w-5 h-5 text-gray-600" />
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            </div>
            <div className="text-sm text-gray-500 font-medium">Total Orders</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="preparing">Preparing</option>
              <option value="shipped">Shipped</option>
              <option value="done">Done</option>
            </select>
          </div>
          <button
            onClick={fetchOrders}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh List
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Try changing the filter or refresh the list</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <AdminOrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};