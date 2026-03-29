import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, ArrowRight, Package, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersService } from '../services/orders';
import { Order } from '../types';
import { Header } from '../components/Header';
import { formatPrice } from '../utils/formatters';
import { getShippingFee } from '../utils/shipping';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Identifiant de commande manquant.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await ordersService.getOrderById(orderId);
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('Commande introuvable.');
        }
      } catch (err) {
        setError('Impossible de charger les détails de la commande.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-500 font-bold">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">{error || 'Commande non trouvée'}</h2>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Home className="w-5 h-5" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shippingFee = order.shippingFee ?? getShippingFee(order.client?.city ?? '');

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-8"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight"
          >
            Merci pour votre commande !
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-lg font-medium"
          >
            Votre commande <span className="text-primary font-black">#{order.id}</span> est confirmée.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 bg-gradient-to-br from-primary to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black">Suivez votre colis</h2>
              </div>
              <p className="text-blue-100 mb-8 font-medium leading-relaxed">
                Gardez un œil sur l&apos;avancement de votre livraison en temps réel sur notre page de suivi.
              </p>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all group"
              >
                Suivre ma commande
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</p>
                  <p className="text-sm font-black text-gray-900 capitalize">{order.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Livraison</p>
                  {shippingFee === 0 ? (
                    <p className="text-sm font-black text-green-600">Gratuite</p>
                  ) : (
                    <p className="text-sm font-black text-gray-900">{formatPrice(shippingFee)} DH</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50"
          >
            <h2 className="text-xl font-black text-gray-900 mb-6">Informations</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-400">Date</span>
                <span className="text-sm font-black text-gray-900">{order.createdAt.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-400">Total payé</span>
                <span className="text-xl font-black text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50"
          >
            <h2 className="text-xl font-black text-gray-900 mb-6">Client</h2>
            <div className="space-y-3">
              <p className="text-sm font-black text-gray-900">{order.client?.name}</p>
              <p className="text-sm font-bold text-gray-500">{order.client?.phone}</p>
              {order.client?.city && <p className="text-sm font-bold text-gray-500">{order.client.city}</p>}
              <p className="text-sm text-gray-400 leading-relaxed">{order.client?.address}</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 mb-12"
        >
          <h2 className="text-xl font-black text-gray-900 mb-6">Articles commandés</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary font-black text-xs border border-gray-100">
                    {item.quantity}x
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{item.name}</p>
                    {!!item.variantName && (
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Couleur : {item.variantName}</p>
                    )}
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatPrice(item.price)} / unité</p>
                  </div>
                </div>
                <p className="text-sm font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 bg-primary text-white px-10 py-5 rounded-3xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Home className="w-5 h-5" />
            Retour à l&apos;accueil
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-100 px-10 py-5 rounded-3xl font-black hover:bg-gray-50 transition-all shadow-xl shadow-gray-200/50 active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            Mon Panier
          </Link>
        </div>
      </main>
    </div>
  );
};
