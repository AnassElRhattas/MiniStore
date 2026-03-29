import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Review } from '../types';
import { reviewsService } from '../services/reviews';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsService.getReviewsByProductId(productId);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Don't show error to user if it's just empty or index issue, just show empty list
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      
      const newReview = await reviewsService.addReview({
        productId,
        userName: userName.trim(),
        rating,
        comment: comment.trim(),
      });

      setReviews([newReview, ...reviews]);
      setUserName('');
      setRating(5);
      setComment('');
      setShowForm(false);
    } catch (err) {
      setError("Impossible d'envoyer votre avis. Veuillez réessayer.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Number(averageRating) ? 'fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 font-medium">
              {averageRating} ({reviews.length} avis)
            </span>
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Donner mon avis
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Écrire un avis</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note globale
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Votre nom
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Votre commentaire
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Partagez votre expérience avec ce produit..."
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {submitting ? 'Envoi...' : 'Publier l\'avis'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement des avis...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">Aucun avis pour le moment.</p>
            <p className="text-sm text-gray-400">Soyez le premier à donner votre avis !</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.userName}</p>
                    <div className="flex text-yellow-400 text-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {review.createdAt.toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mt-2 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
