import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.product.stock) {
      updateQuantity(item.product.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(item.product.id);
  };

  const increment = () => {
    if (item.quantity < item.product.stock) {
      updateQuantity(item.product.id, item.quantity + 1);
    }
  };

  const decrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/80x80?text=No+Image';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.product.name}
            </h3>
            <button
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={decrement}
                disabled={item.quantity <= 1}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="text-lg font-medium min-w-[3rem] text-center">
                {item.quantity}
              </span>
              
              <button
                onClick={increment}
                disabled={item.quantity >= item.product.stock}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold text-blue-600">
                {(item.product.price * item.quantity).toLocaleString()} DH
              </p>
              <p className="text-sm text-gray-500">
                {item.product.price.toLocaleString()} DH each
              </p>
            </div>
          </div>

          {item.quantity >= item.product.stock && (
            <p className="text-xs text-orange-600 mt-2">
              Maximum stock available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};