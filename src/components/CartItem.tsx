import React from 'react';
import { Trash2, Plus, Minus, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleRemove = () => {
    removeItem(item.product.id, item.variant?.name);
    toast.error(`${item.product.name} retiré du panier`);
  };

  const increment = () => {
    if (item.quantity < item.product.stock) {
      updateQuantity(item.product.id, item.quantity + 1, item.variant?.name);
    } else {
      toast.warning("Stock maximum atteint");
    }
  };

  const decrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1, item.variant?.name);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="w-full sm:w-28 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
          <img
            src={item.variant?.imageUrl || item.product.imageUrl}
            alt={item.product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,sans-serif' font-size='10' fill='%239ca3af'>Image</text></svg>";
            }}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                  {item.product.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 truncate pr-4">
                {item.product.name}
              </h3>
              {item.variant?.name && (
                <div className="flex items-center gap-2 mt-1">
                  {item.variant.hex && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-gray-200"
                      style={{ backgroundColor: item.variant.hex }}
                      aria-label={`Couleur ${item.variant.name}`}
                    />
                  )}
                  <span className="text-xs font-semibold text-gray-500">Couleur : {item.variant.name}</span>
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              className="text-gray-300 hover:text-red-500 transition-colors p-2 bg-gray-50 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 mt-auto">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quantité</span>
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={decrement}
                  disabled={item.quantity <= 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>

                <span className="text-sm font-black min-w-[3rem] text-center text-gray-900">
                  {item.quantity}
                </span>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={increment}
                  disabled={item.quantity >= item.product.stock}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end text-gray-400 mb-1">
                <Package className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">{item.product.stock} en stock</span>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-xl font-black text-primary leading-tight">
                  {(item.product.price * item.quantity).toLocaleString()} <span className="text-xs">DH</span>
                </p>
                <p className="text-[10px] font-bold text-gray-400">
                  {item.product.price.toLocaleString()} DH / unité
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
