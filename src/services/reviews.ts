import { db } from '../firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { Review } from '../types';

const REVIEWS_COLLECTION = 'reviews';

export const reviewsService = {
  async getReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Review));
    } catch (error) {
      console.error('Error getting reviews:', error);
      // If the index is missing, it might fail. For now, fallback to client-side sorting if needed or just handle error.
      // Ideally, Firestore will provide a link to create the index in the console error.
      throw error;
    }
  },

  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
        ...reviewData,
        createdAt: serverTimestamp(),
      });
      
      return {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
};
