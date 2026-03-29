import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      addItem(product, 1, product.colorVariants?.[0]);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all h-full flex flex-col">
      <Link
        to={`/product/${product.id}`}
        className="relative flex-1 flex flex-col"
        aria-label={`Voir le produit ${product.name}`}
      >
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              isOutOfStock ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            {isOutOfStock ? 'Épuisé' : 'En Stock'}
          </span>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,sans-serif' font-size='16' fill='%236b7280'>Image</text></svg>";
            }}
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <span className="text-primary text-xs font-black">Voir</span>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
            {product.category ?? 'Produit'}
          </span>
          <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs mb-4 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400 line-through decoration-red-400/30">
                {(product.price * 1.2).toLocaleString()} DH
              </span>
              <span className="text-xl font-black text-primary">
                {product.price.toLocaleString()} <span className="text-xs">DH</span>
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-400">{product.stock} restants</span>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
          }`}
          aria-label={isOutOfStock ? `Produit ${product.name} indisponible` : `Ajouter ${product.name} au panier`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
};
