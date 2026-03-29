import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
import { productsService } from '@/services/products';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { ShieldCheck, Truck, BadgePercent, Search as SearchIcon, ArrowUpDown, RefreshCw, Sparkles } from 'lucide-react';
import HamidProfil from '@/assets/HamidProfil.jpg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'stock-desc'>('newest');

  const reloadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Impossible de charger les produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = products;

    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'stock-desc':
        list = [...list].sort((a, b) => b.stock - a.stock);
        break;
      case 'newest':
      default:
        list = [...list].sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
    }

    return list;
  }, [products, search, sortBy, selectedCategory]);

  const categories = useMemo(() => {
     const cats = new Set(products.map(p => p.category).filter(Boolean));
     return ['All', ...Array.from(cats)].sort();
   }, [products]);

  const featuredProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-700 text-white p-8 md:p-16 shadow-2xl shadow-primary/20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-white/10">
            <div className="flex-1 z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 mb-6"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Nouvelle Collection 2024</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
                Bienvenue chez <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">BUS STORE</span>
              </h1>
              <p className="text-blue-100/80 text-lg md:text-xl mb-10 leading-relaxed max-w-xl font-medium">
                L&apos;excellence du shopping en ligne. Des produits sélectionnés avec soin pour votre satisfaction totale au Maroc.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/" className="bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  Découvrir
                </Link>
                <Link to="/cart" className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">
                  Mon Panier
                </Link>
              </div>
            </div>

            <div className="relative z-10 flex-shrink-0 group">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img
                  src={HamidProfil}
                  alt="Hamid - Fondateur"
                  className="w-56 h-56 md:w-72 md:h-72 rounded-[3rem] object-cover border-4 border-white shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-700"
                />
                <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-blue-950 text-xs font-black px-6 py-3 rounded-2xl shadow-xl border-4 border-white transform -rotate-3 group-hover:rotate-0 transition-transform">
                  DEPUIS 2024
                </div>
              </motion.div>
            </div>

            <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-80 h-80 bg-blue-500/40 rounded-full blur-[100px]"></div>
          </div>
        </motion.div>

        {!loading && !error && featuredProducts.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Coups de cœur</h2>
                <div className="h-1.5 w-12 bg-primary rounded-full"></div>
              </div>
              <Link to="/" className="text-sm font-bold text-primary hover:text-indigo-700 transition-colors flex items-center gap-1 group">
                Voir tout <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Truck, title: 'Livraison Express', desc: 'Partout au Maroc', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: ShieldCheck, title: 'Paiement Sécurisé', desc: '100% garanti', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: BadgePercent, title: 'Meilleurs Prix', desc: 'Offres exclusives', color: 'text-indigo-600', bg: 'bg-indigo-50' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="flex items-center gap-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all"
            >
              <div className={`${feature.bg} p-4 rounded-2xl`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{feature.title}</p>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-10 sticky top-20 z-30">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1 group">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                aria-label="Rechercher un produit"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:flex-none">
                <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-11 pr-8 py-3.5 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold appearance-none cursor-pointer"
                  aria-label="Trier les produits"
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="stock-desc">En stock</option>
                </select>
              </div>
              <button
                onClick={reloadProducts}
                className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md text-gray-600 active:scale-90 transition-all group"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="mb-10 flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-primary/30 hover:text-primary hover:shadow-md'
                }`}
              >
                {category === 'All' ? 'Tous les produits' : category}
              </button>
            ))}
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">
            {selectedCategory === 'All' ? 'Notre Boutique' : selectedCategory}
          </h2>
          <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold">
            {filteredProducts.length} Produits
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl mb-6"></div>
                <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2 mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-100 rounded-xl w-1/3"></div>
                  <div className="h-10 bg-gray-100 rounded-xl w-10"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-900 font-bold text-xl mb-2">{error}</p>
            <p className="text-gray-500 mb-8">Vérifiez votre connexion internet et réessayez.</p>
            <button 
              onClick={reloadProducts}
              className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + search + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                  <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}
