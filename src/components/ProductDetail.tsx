import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { productsService } from '../services/products';
import { useCart } from '../contexts/CartContext';
import { ProductGrid } from './ProductGrid';
import { ProductReviews } from './ProductReviews';
import { Header } from './Header';
import { Footer } from './Footer';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const FALLBACK_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,sans-serif' font-size='24' fill='%236b7280'>Image</text></svg>";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await productsService.getProductById(id);
        if (productData) {
          setProduct(productData);
        } else {
          setError('Produit introuvable.');
        }
      } catch (err) {
        setError('Impossible de charger le produit.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    setSelectedVariantIndex(0);
  }, [product?.id]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!id) return;
      try {
        const all = await productsService.getAllProducts();
        const others = all.filter(p => p.id !== id).slice(0, 4);
        setRelatedProducts(others);
      } catch {}
    };
    fetchRelated();
  }, [id]);

  const handleAddToCart = () => {
    if (product && quantity > 0 && quantity <= product.stock) {
      addItem(product, quantity, product.colorVariants?.[selectedVariantIndex]);
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-2xl h-96"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || 'Produit introuvable'}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la boutique
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const selectedVariant = product.colorVariants?.[selectedVariantIndex];
  const displayImageUrl = selectedVariant?.imageUrl || product.imageUrl;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-xl px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la boutique
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-200">
              <img
                src={displayImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_IMAGE;
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-3xl font-extrabold text-blue-600">
                  {product.price.toLocaleString()} DH
                </span>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${isOutOfStock ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {isOutOfStock ? 'Rupture de stock' : `Stock : ${product.stock}`}
                </span>
              </div>

              {!!product.colorVariants?.length && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-700 font-semibold">Couleur</span>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {product.colorVariants.map((variant, idx) => {
                      const isSelected = idx === selectedVariantIndex;
                      return (
                        <button
                          key={`${variant.name}-${idx}`}
                          type="button"
                          onClick={() => setSelectedVariantIndex(idx)}
                          className={`w-9 h-9 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                            isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-label={`Choisir la couleur ${variant.name}`}
                          title={variant.name}
                          style={{ backgroundColor: variant.hex || 'transparent' }}
                        >
                          {!variant.hex && (
                            <span className="block w-full h-full rounded-xl bg-gray-50" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!!selectedVariant?.name && (
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">Couleur sélectionnée :</span> {selectedVariant.name}
                </div>
              )}

              {!isOutOfStock && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-700 font-semibold">Quantité</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold">{quantity}</span>
                      <button
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-6 rounded-2xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter au panier
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-semibold text-gray-700">Référence :</span> <span className="font-mono">{product.id}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Ajouté le :</span> {product.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <ProductReviews productId={product.id} />
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Produits similaires</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
