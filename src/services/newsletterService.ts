// API service for newsletter
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const newsletterService = {
  // Subscribe to newsletter
  subscribe: async (email: string, preferences = {}): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      console.log('📧 Subscribing to newsletter:', email);

      const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, preferences }),
      });

      console.log('📡 Newsletter subscription response status:', response.status);

      const data = await response.json();
      console.log('✅ Newsletter subscription response:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Failed to subscribe: ${response.statusText}`
        };
      }

      return {
        success: true,
        message: data.message || 'Successfully subscribed to newsletter'
      };

    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return {
        success: false,
        error: 'Failed to subscribe. Please check your connection and try again.'
      };
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email: string, token: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      console.log('📧 Unsubscribing from newsletter:', email);

      const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      console.log('📡 Newsletter unsubscription response status:', response.status);

      const data = await response.json();
      console.log('✅ Newsletter unsubscription response:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Failed to unsubscribe: ${response.statusText}`
        };
      }

      return {
        success: true,
        message: data.message || 'Successfully unsubscribed from newsletter'
      };

    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      return {
        success: false,
        error: 'Failed to unsubscribe. Please check your connection and try again.'
      };
    }
  }
};
