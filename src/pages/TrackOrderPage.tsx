import React, { useState } from 'react';
import { ordersService } from '../services/orders';
import { Order } from '../types';
import { Package, Clock, Truck, CheckCircle, AlertCircle, ArrowLeft, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { formatPrice } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const TrackOrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const data = await ordersService.getOrderById(orderId.trim());
      setOrder(data);
      if (!data) {
        setError("Aucune commande trouvée avec cet identifiant.");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la recherche.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, text: 'En attente', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' };
      case 'paid':
        return { icon: CheckCircle, text: 'Payée', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'preparing':
        return { icon: Package, text: 'En préparation', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
      case 'shipped':
        return { icon: Truck, text: 'Expédiée', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' };
      case 'done':
        return { icon: CheckCircle, text: 'Livrée', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
      default:
        return { icon: AlertCircle, text: status, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      
      <main className="flex-grow pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Retour à la boutique
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 mb-10"
          >
            <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Suivre ma commande</h1>
            <p className="text-gray-500 font-medium mb-10">Entrez votre numéro de commande pour connaître son état d'avancement.</p>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow group">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="ID de commande (ex: ab12cd34...)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !orderId.trim()}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {loading ? 'Recherche...' : 'Suivre'}
              </motion.button>
            </form>
          </motion.div>

          <AnimatePresence mode="wait">
            {searched && !loading && (
              <motion.div
                key={order ? order.id : 'error'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {error ? (
                  <div className="bg-red-50 border border-red-100 p-10 rounded-[3rem] text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-900 font-black text-xl mb-2">Oups !</p>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                ) : order && (
                  <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-10 border-b border-gray-50 bg-gray-50/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Numéro de commande</p>
                          <h2 className="text-2xl font-black text-gray-900 tracking-tight">#{order.id.toString().toUpperCase()}</h2>
                        </div>
                        <div className={`inline-flex items-center px-6 py-3 rounded-2xl border ${getStatusInfo(order.status).bg} ${getStatusInfo(order.status).color} ${getStatusInfo(order.status).border} shadow-sm`}>
                          {React.createElement(getStatusInfo(order.status).icon, { className: "w-5 h-5 mr-3" })}
                          <span className="font-black uppercase tracking-wider text-xs">{getStatusInfo(order.status).text}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 space-y-12">
                      <div className="relative pl-4 sm:pl-0">
                        <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-1 bg-gray-50 -translate-x-1/2 rounded-full hidden sm:block"></div>
                        <div className="space-y-12 relative">
                          {[
                            { status: 'pending', label: 'Commande reçue', desc: 'Nous avons bien reçu votre demande' },
                            { status: 'paid', label: 'Paiement confirmé', desc: 'Le règlement a été validé' },
                            { status: 'preparing', label: 'En préparation', desc: 'Nous emballons vos articles' },
                            { status: 'shipped', label: 'Expédiée', desc: 'Votre colis est en route' },
                            { status: 'done', label: 'Livrée', desc: 'Colis remis en mains propres' }
                          ].map((step, index) => {
                            const statusOrder = ['pending', 'paid', 'preparing', 'shipped', 'done'];
                            const currentIndex = statusOrder.indexOf(order.status);
                            const isCompleted = index <= currentIndex;
                            const isCurrent = index === currentIndex;

                            return (
                              <div key={step.status} className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0 ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                                <div className="sm:w-1/2 sm:px-12 text-left sm:text-right">
                                  {index % 2 !== 0 && (
                                    <div className="sm:text-left">
                                      <h3 className={`text-lg font-black ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</h3>
                                      <p className="text-sm text-gray-400 font-medium mt-1">{step.desc}</p>
                                    </div>
                                  )}
                                  {index % 2 === 0 && (
                                    <div className="sm:text-right">
                                      <h3 className={`text-lg font-black ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</h3>
                                      <p className="text-sm text-gray-400 font-medium mt-1">{step.desc}</p>
                                    </div>
                                  )}
                                </div>

                                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                                  isCompleted ? 'bg-primary text-white scale-110 shadow-primary/20' : 'bg-white border-2 border-gray-100 text-gray-300'
                                }`}>
                                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <div className="w-2.5 h-2.5 rounded-full bg-current"></div>}
                                </div>

                                <div className="sm:w-1/2 sm:px-12">
                                  {isCurrent && (
                                    <motion.div
                                      initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg"
                                    >
                                      Étape actuelle
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-10 border-t border-gray-50">
                        <h3 className="text-xl font-black text-gray-900 mb-6">Récapitulatif</h3>
                        <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-4">
                                <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-primary font-black text-[10px] border border-gray-100 shadow-sm">
                                  {item.quantity}x
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-700 text-sm truncate">{item.name}</div>
                                  {!!item.variantName && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {!!item.variantHex && (
                                        <span
                                          className="w-3 h-3 rounded-full border border-gray-200"
                                          style={{ backgroundColor: item.variantHex }}
                                          aria-label={`Couleur ${item.variantName}`}
                                        />
                                      )}
                                      <span className="text-[11px] font-semibold text-gray-500">Couleur : {item.variantName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="font-black text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                            <span className="text-lg font-black text-gray-900">Total</span>
                            <span className="text-3xl font-black text-primary">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};
