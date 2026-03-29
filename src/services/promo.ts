import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  increment 
} from 'firebase/firestore';
import { PromoCode } from '../types';

const PROMO_COLLECTION = 'promo_codes';

export const promoService = {
  async getAllPromoCodes(): Promise<PromoCode[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PROMO_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate()
      } as PromoCode));
    } catch (error) {
      console.error('Error getting promo codes:', error);
      throw error;
    }
  },

  async validatePromoCode(code: string, orderAmount: number): Promise<PromoCode> {
    try {
      const q = query(
        collection(db, PROMO_COLLECTION), 
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Code promo invalide ou expiré.');
      }

      const promoDoc = querySnapshot.docs[0];
      const promoData = {
        id: promoDoc.id,
        ...promoDoc.data(),
        expiryDate: promoDoc.data().expiryDate?.toDate()
      } as PromoCode;

      // Check expiry
      if (promoData.expiryDate && promoData.expiryDate < new Date()) {
        throw new Error('Ce code promo a expiré.');
      }

      // Check min amount
      if (promoData.minOrderAmount && orderAmount < promoData.minOrderAmount) {
        throw new Error(`Le montant minimum pour ce code est de ${promoData.minOrderAmount} DH.`);
      }

      // Check usage limit
      if (promoData.usageLimit && promoData.usageCount >= promoData.usageLimit) {
        throw new Error('Ce code promo a atteint sa limite d\'utilisation.');
      }

      return promoData;
    } catch (error: any) {
      throw error;
    }
  },

  async createPromoCode(promoData: Omit<PromoCode, 'id' | 'usageCount'>): Promise<PromoCode> {
    try {
      const docRef = await addDoc(collection(db, PROMO_COLLECTION), {
        ...promoData,
        code: promoData.code.toUpperCase(),
        usageCount: 0
      });
      return { id: docRef.id, ...promoData, usageCount: 0 } as PromoCode;
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  },

  async updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<void> {
    try {
      const docRef = doc(db, PROMO_COLLECTION, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating promo code:', error);
      throw error;
    }
  },

  async deletePromoCode(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PROMO_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting promo code:', error);
      throw error;
    }
  },

  async incrementUsage(id: string): Promise<void> {
    try {
      const docRef = doc(db, PROMO_COLLECTION, id);
      await updateDoc(docRef, {
        usageCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing promo usage:', error);
    }
  }
};
