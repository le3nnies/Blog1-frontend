import { loadStripe, Stripe } from '@stripe/stripe-js';

// Types
export interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  campaignId?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  error?: string;
}

export interface Transaction {
  _id: string;
  stripePaymentIntentId: string;
  userId: string;
  userEmail: string;
  campaignId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'canceled';
  paymentMethod: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  failureReason?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionTestRequest {
  stripePublicKey?: string;
  stripeSecretKey?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  valid: boolean;
  message: string;
  account?: {
    livemode: boolean;
    currency: string;
  };
}

export interface WebhookGenerationRequest {
  webhookUrl: string;
  stripeSecretKey?: string;
}

export interface WebhookGenerationResponse {
  success: boolean;
  webhookSecret?: string;
  webhookId?: string;
  url?: string;
  message?: string;
  error?: string;
}

class StripeService {
  private stripe: Stripe | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL;
  }

  // Initialize Stripe with public key
  async initializeStripe(publicKey?: string): Promise<Stripe | null> {
    if (this.stripe) return this.stripe;

    try {
      const key = publicKey || process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
      if (!key) {
        console.error('Stripe public key is not configured');
        return null;
      }

      this.stripe = await loadStripe(key);
      return this.stripe;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return null;
    }
  }

  // Get Stripe instance
  getStripe(): Stripe | null {
    return this.stripe;
  }

  // Create payment intent
  async createPaymentIntent(data: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ads/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      return result;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Process payment (complete flow)
  async processPayment(amount: number, campaignId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Create payment intent
      const paymentIntent = await this.createPaymentIntent({
        amount,
        currency: 'usd',
        campaignId
      });

      if (!paymentIntent.success || !paymentIntent.clientSecret) {
        throw new Error(paymentIntent.error || 'Failed to create payment intent');
      }

      // 2. Initialize Stripe
      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // 3. Confirm payment
      const { error } = await stripe.confirmPayment({
        clientSecret: paymentIntent.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?payment_intent=${paymentIntent.paymentIntentId}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  // Process payment with card element
  async processPaymentWithCard(
    amount: number, 
    elements: any, // StripeElements instance
    campaignId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Create payment intent
      const paymentIntent = await this.createPaymentIntent({
        amount,
        currency: 'usd',
        campaignId
      });

      if (!paymentIntent.success || !paymentIntent.clientSecret) {
        throw new Error(paymentIntent.error || 'Failed to create payment intent');
      }

      // 2. Initialize Stripe
      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // 3. Confirm payment with Stripe Elements instance
      const { error } = await stripe.confirmPayment({
        elements: elements,
        clientSecret: paymentIntent.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'always'
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Card payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Card payment failed'
      };
    }
  }

  // Test Stripe connection (admin only)
  async testConnection(data: ConnectionTestRequest): Promise<ConnectionTestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ads/stripe/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Connection test failed');
      }

      return result;
    } catch (error) {
      console.error('Stripe connection test error:', error);
      return {
        success: false,
        valid: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  // Generate webhook (admin only)
  async generateWebhook(data: WebhookGenerationRequest): Promise<WebhookGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ads/stripe/generate-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate webhook');
      }

      return result;
    } catch (error) {
      console.error('Webhook generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook generation failed'
      };
    }
  }

  // Get transaction history
  async getTransactions(limit: number = 10): Promise<{ success: boolean; data?: Transaction[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ads/stripe/transactions?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }

      return result;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions'
      };
    }
  }

  // Get specific transaction
  async getTransaction(transactionId: string): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ads/stripe/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transaction');
      }

      return result;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(paymentIntentId: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ads/stripe/payment-status/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to check payment status');
      }

      return result;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check payment status'
      };
    }
  }

  // Utility method to get auth token (adjust based on your auth setup)
  private getAuthToken(): string {
    // Example: Get token from localStorage, cookies, or auth context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  }

  // Utility method to format amount for display
  formatAmount(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  // Utility method to get payment status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      case 'refunded':
        return 'blue';
      case 'canceled':
        return 'gray';
      default:
        return 'gray';
    }
  }

  // Utility method to get payment status text
  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Unknown';
    }
  }
}

// Create and export singleton instance
export const stripeService = new StripeService();
export default stripeService;