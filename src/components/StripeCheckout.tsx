import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createCheckoutSession, initializeStripe } from '@/services/stripe';
import { CartItem, ClientInfo } from '@/types';

// Initialize Stripe
const stripePromise = initializeStripe();

interface StripeCheckoutProps {
  items: CartItem[];
  total: number;
  clientInfo: ClientInfo;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

const CheckoutForm: React.FC<{
  items: CartItem[];
  total: number;
  clientInfo: ClientInfo;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}> = ({ items, total, clientInfo, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Create payment intent on backend
      // 2. Confirm payment with Stripe Elements
      // 3. Handle 3D Secure authentication if needed
      
      console.log('Processing payment with Stripe...');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      const paymentIntentId = `pi_${Date.now()}`;
      console.log('Payment successful:', paymentIntentId);
      
      onPaymentSuccess(paymentIntentId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          {/* This is a mock implementation */}
          <div className="text-sm text-gray-600">
            <p>Stripe Card Element would appear here</p>
            <p className="text-xs mt-1">Mock implementation - no real payment processing</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing...' : `Pay ${total.toFixed(2)} DH`}
      </button>
    </form>
  );
};

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  items,
  total,
  clientInfo,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [useStripeCheckout, setUseStripeCheckout] = useState(false);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    
    try {
      // Create checkout session
      const session = await createCheckoutSession({
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total,
        orderId: `order_${Date.now()}`,
        customerEmail: clientInfo.email ?? 'customer@example.com',
      });

      console.log('Checkout session created:', session);
      
      // In a real implementation, you would redirect to Stripe Checkout
      // For now, we'll simulate a successful payment
      setTimeout(() => {
        onPaymentSuccess(session.paymentIntent);
      }, 2000);
      
    } catch (error) {
      console.error('Stripe checkout error:', error);
      onPaymentError('Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Stripe Payment Integration</h3>
        <p className="text-sm text-blue-700 mb-4">
          This is a mock implementation of Stripe payment processing. 
          In a production environment, this would integrate with real Stripe services.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={handleStripeCheckout}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Session...' : 'Use Stripe Checkout'}
          </button>
          
          <button
            onClick={() => setUseStripeCheckout(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Use Embedded Checkout
          </button>
        </div>
      </div>

      {useStripeCheckout && (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            items={items}
            total={total}
            clientInfo={clientInfo}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        </Elements>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-sm text-yellow-700">
          <strong>Note:</strong> This is a demonstration implementation. 
          To enable real payments, you would need to:
        </p>
        <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
          <li>Set up a Stripe account</li>
          <li>Add your Stripe publishable key to environment variables</li>
          <li>Implement backend Cloud Functions for payment processing</li>
          <li>Configure webhook endpoints for payment events</li>
          <li>Enable real payment methods in Stripe Dashboard</li>
        </ul>
      </div>
    </div>
  );
};

// Export a simple hook for Stripe integration
export const useStripePayment = () => {
  const processPayment = async (amount: number, currency: string = 'usd') => {
    // This is a mock implementation
    console.log(`Processing ${currency} ${amount} payment...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock 90% success rate for testing
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        paymentIntentId: `pi_${Date.now()}`,
        message: 'Payment processed successfully'
      };
    } else {
      return {
        success: false,
        error: 'Payment declined. Please try a different payment method.'
      };
    }
  };

  return { processPayment };
};
