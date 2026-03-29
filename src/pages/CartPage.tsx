import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Ticket, X, Trash2, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CartItem } from '../components/CartItem';
import { useCart } from '../contexts/CartContext';
import { Header } from '../components/Header';
import { promoService } from '../services/promo';
import { formatPrice } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const { items, clearCart, getTotalPrice, promoCode, setPromoCode, getDiscountAmount, getFinalPrice } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    try {
      setPromoLoading(true);
      setPromoError(null);
      const promo = await promoService.validatePromoCode(promoInput.trim(), getTotalPrice());
      setPromoCode(promo);
      setPromoInput('');
      toast.success("Code promo appliqué !");
    } catch (err: any) {
      setPromoError(err.message);
      toast.error(err.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoCode(null);
    toast.info("Code promo retiré");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12"
        >
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
              Il semble que vous n&apos;ayez pas encore ajouté de produits. Découvrez nos offres exceptionnelles !
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              Continuer mes achats
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la boutique
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">Mon Panier</h1>
                <p className="text-gray-500 font-medium">Vous avez {items.length} articles dans votre panier</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  clearCart();
                  toast.success("Panier vidé");
                }}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Vider le panier
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map(item => (
                  <CartItem key={`${item.product.id}-${item.variant?.name ?? 'default'}`} item={item} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-28 space-y-8"
            >
              <h2 className="text-2xl font-black text-gray-900">Résumé</h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-400">Sous-total</span>
                    <span className="text-gray-900">{formatPrice(getTotalPrice())}</span>
                  </div>

                  {promoCode ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-between text-sm text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100 relative"
                    >
                      <div className="flex flex-col">
                        <span className="font-black flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                          <Ticket className="w-3.5 h-3.5" />
                          Code: {promoCode.code}
                        </span>
                        <span className="text-[10px] font-bold">Promotion appliquée</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black">-{formatPrice(getDiscountAmount())}</span>
                        <button
                          onClick={removePromo}
                          className="p-1.5 hover:bg-green-100 rounded-lg transition-colors text-green-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="space-y-3">
                      <div className="relative group">
                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder="Code promo"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="w-full pl-12 pr-24 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all"
                        />
                        <button
                          type="submit"
                          disabled={promoLoading || !promoInput.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                        >
                          {promoLoading ? '...' : 'Appliquer'}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[10px] text-red-500 font-black px-2 flex items-center gap-1.5">
                          <X className="w-3 h-3" /> {promoError}
                        </p>
                      )}
                    </form>
                  )}

                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-400">Livraison</span>
                    <span className="text-gray-500 font-black">Selon la ville</span>
                  </div>
                </div>

                <div className="border-t border-gray-50 pt-6">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-lg font-bold text-gray-400">Total</span>
                    <span className="text-3xl font-black text-primary">
                      {formatPrice(getFinalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary text-white py-5 rounded-[1.5rem] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-center flex items-center justify-center gap-3 font-black text-lg group"
              >
                Commander
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  →
                </motion.span>
              </Link>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Sécurisé
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  Stripe
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
