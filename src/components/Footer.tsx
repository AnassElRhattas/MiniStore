import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">BUS STORE</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Une sélection de produits de qualité, livrés rapidement partout au Maroc.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navigation</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors">
                  Panier
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-primary transition-colors">
                  Suivre ma commande
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact</h3>
            <div className="space-y-4 text-sm">
              <p className="text-sm">
                Email: <a className="hover:text-white transition-colors" href="mailto:support@busstore.ma">support@busstore.ma</a>
              </p>
              <p className="text-sm">
                Téléphone: <a className="hover:text-white transition-colors" href="tel:+212500000000">+212 5XX-XXXXXX</a>
              </p>
              <p className="text-xs text-gray-400">
                Réponse rapide via WhatsApp et téléphone.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          <p>&copy; {new Date().getFullYear()} BUS STORE. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span>Paiement 100% sécurisé</span>
            <div className="h-4 w-px bg-gray-800"></div>
            <span>Livraison partout au Maroc</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
