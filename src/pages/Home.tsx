import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
import { productsService } from '@/services/products';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { ShieldCheck, Truck, BadgePercent, Search as SearchIcon, ArrowUpDown } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'stock-desc'>('newest');

  const reloadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
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
        list = [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return list;
  }, [products, search, sortBy]);

  const featuredProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="flex-1 z-10">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Bienvenue chez <span className="text-blue-200">Mini Store</span>
              </h1>
              <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
                Découvrez notre sélection exclusive de produits de qualité. Une expérience de shopping unique, pensée pour vous.
              </p>
              
              <div className="inline-flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-blue-200 uppercase tracking-wider">Le mot du propriétaire</span>
                  <span className="text-lg font-serif italic">"Votre satisfaction est notre priorité absolue."</span>
                  <span className="text-sm font-bold mt-1">— Hamid, Fondateur</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link to="/" className="bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold shadow hover:shadow-md transition">Découvrir la boutique</Link>
                <Link to="/cart" className="bg-blue-500/20 text-white px-5 py-3 rounded-xl border border-white/20 hover:bg-blue-500/30 transition">Voir le panier</Link>
              </div>
            </div>

            <div className="relative z-10 flex-shrink-0">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative">
                <img 
                  src="src/assets/HamidProfil.jpg" 
                  alt="Propriétaire du magasin" 
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-8 border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-blue-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg border-2 border-white transform rotate-3">
                  Depuis 2024
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"></div>
          </div>
        </div>

        {!loading && !error && featuredProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Produits en vedette</h2>
              <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">Voir tout</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 md:mt-12 mb-10 md:mb-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition">
            <Truck className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Livraison rapide</p>
              <p className="text-xs text-gray-600">Partout au Maroc</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Paiement sécurisé</p>
              <p className="text-xs text-gray-600">Vos données protégées</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition">
            <BadgePercent className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Promos régulières</p>
              <p className="text-xs text-gray-600">Meilleurs prix garantis</p>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <ArrowUpDown className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix: croissant</option>
                  <option value="price-desc">Prix: décroissant</option>
                  <option value="stock-desc">Stock: décroissant</option>
                </select>
              </div>
              <button
                onClick={reloadProducts}
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
              >
                Rafraîchir
              </button>
            </div>
            <div className="md:ml-auto text-sm text-gray-600">Résultats: {filteredProducts.length}</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tous les produits</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={reloadProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </main>

      <Footer />
    </div>
  );
}
