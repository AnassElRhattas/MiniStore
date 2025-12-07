import React from 'react';
import { Order, OrderStatus } from '../types';

interface AdminOrderRowProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  preparing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  done: 'bg-gray-100 text-gray-800',
};

const statusOptions: OrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'done'];

export const AdminOrderRow: React.FC<AdminOrderRowProps> = ({ order, onStatusChange }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    onStatusChange(order.id, newStatus);
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {order.id.substring(0, 8)}...
        </div>
        <div className="text-xs text-gray-500">
          {order.createdAt.toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{order.client.name}</div>
        <div className="text-xs text-gray-500">{order.client.phone}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{order.items.length} items</div>
        <div className="text-xs text-gray-500">
          {order.items.map(item => item.name).join(', ').substring(0, 30)}
          {order.items.map(item => item.name).join(', ').length > 30 && '...'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {order.total.toLocaleString()} DH
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={order.status}
          onChange={handleStatusChange}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
};