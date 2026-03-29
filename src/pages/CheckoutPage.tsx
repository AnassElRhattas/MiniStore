import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckoutForm } from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext';
import { ordersService } from '../services/orders';
import { ClientInfo } from '../types';
import { Header } from '../components/Header';
import { formatPrice } from '../utils/formatters';
import { getShippingFee } from '../utils/shipping';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, promoCode, getDiscountAmount, getFinalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>('');

  const shippingFee = city ? getShippingFee(city) : 0;
  const totalWithShipping = getFinalPrice() + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
              Ajoutez des produits au panier avant de passer commande.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (clientInfo: ClientInfo) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const order = await ordersService.createOrder(clientInfo, items, promoCode);
      clearCart();
      toast.success("Commande réussie !");
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création de la commande';
      setError(msg);
      toast.error(msg);
      console.error('Error creating order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour au panier
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Paiement</h1>
              <p className="text-gray-500 font-medium">Veuillez remplir vos informations de livraison.</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
              <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} onCityChange={setCity} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-gray-900 px-2">Résumé de la commande</h2>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-28 space-y-6">
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.variant?.name ?? 'default'}`} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={item.variant?.imageUrl || item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      {!!item.variant?.name && (
                        <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Couleur : {item.variant.name}</p>
                      )}
                      <p className="text-xs font-bold text-gray-400">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="text-sm font-black text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-50 pt-6 space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Sous-total</span>
                  <span className="text-gray-900 font-bold">{formatPrice(getTotalPrice())}</span>
                </div>
                
                {promoCode && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                    <span className="font-bold">Remise ({promoCode.code})</span>
                    <span className="font-black">-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Livraison</span>
                  {!city ? (
                    <span className="text-gray-400 font-black">Choisir une ville</span>
                  ) : shippingFee === 0 ? (
                    <span className="text-green-600 font-black">Gratuite</span>
                  ) : (
                    <span className="text-gray-900 font-black">{formatPrice(shippingFee)} DH</span>
                  )}
                </div>

                <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900">Total</span>
                  <span className="text-3xl font-black text-primary">
                    {formatPrice(city ? totalWithShipping : getFinalPrice())}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Sécurisé
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  Paiement Stripe
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
