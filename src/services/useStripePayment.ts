import { useState, useCallback } from 'react';
import { stripeService, PaymentIntentRequest } from './stripeService';

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processPayment = useCallback(async (amount: number, campaignId?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await stripeService.processPayment(amount, campaignId);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Payment failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const processCardPayment = useCallback(async (amount: number, cardElement: any, campaignId?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await stripeService.processPaymentWithCard(amount, cardElement, campaignId);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Card payment failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Card payment failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    processPayment,
    processCardPayment,
    loading,
    error,
    success,
    reset
  };
};