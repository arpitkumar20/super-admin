// Admin Razorpay Integration for Client Payment Processing
// This allows admin to process payments on behalf of clients

declare global {
  interface Window {
    Razorpay: unknown;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

export interface AdminPaymentOptions {
  amount: number; // Amount in rupees
  currency: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  plan: string;
  durationMonths: number;
  orderId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

// Razorpay configuration for admin payments
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your actual key
  key_secret: 'YOUR_KEY_SECRET',
  currency: 'INR',
  name: 'NISAA Admin Portal',
  description: 'Client Subscription Payment',
  theme: {
    color: '#3b82f6'
  }
};

class AdminRazorpayService {
  private isScriptLoaded = false;

  // Load Razorpay script dynamically
  private async loadRazorpayScript(): Promise<boolean> {
    if (this.isScriptLoaded && window.Razorpay) {
      console.log('✅ Razorpay script already loaded');
      return true;
    }

    console.log('📦 Loading Razorpay script...');
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        this.isScriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        resolve(false);
      };
      script.async = true;
      document.head.appendChild(script);
    });
  }

  // Create order (mock - will be replaced with actual API call)
  private async createOrder(amount: number): Promise<{ id: string; amount: number; currency: string }> {
    // Simulate API call to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: orderId,
      amount: amount * 100, // Convert to paise
      currency: 'INR'
    };
  }

  // Process payment for client
  async processClientPayment(options: AdminPaymentOptions): Promise<PaymentResult> {
    try {
      console.log('🚀 Admin processing payment for client:', options.clientName);

      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway');
      }

      // Create order
      const order = await this.createOrder(options.amount);

      // Calculate total amount for subscription duration
      const totalAmount = options.amount * options.durationMonths;

      // Configure Razorpay options
      const razorpayOptions = {
        key: RAZORPAY_CONFIG.key_id,
        amount: totalAmount * 100, // Convert to paise
        currency: options.currency,
        name: RAZORPAY_CONFIG.name,
        description: `${options.plan} Plan - ${options.durationMonths} month(s) for ${options.clientName}`,
        order_id: order.id,
        image: '/favicon.ico',
        prefill: {
          name: options.clientName,
          email: options.clientEmail,
          contact: options.clientPhone
        },
        notes: {
          client_id: options.clientId,
          plan: options.plan,
          duration_months: options.durationMonths.toString(),
          processed_by: 'admin',
          total_amount: totalAmount.toString()
        },
        theme: {
          color: RAZORPAY_CONFIG.theme.color
        },
        method: {
          netbanking: true,
          card: true,
          wallet: true,
          upi: true,
          paylater: true,
          emi: true
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          confirm_close: true,
          ondismiss: () => {
            console.log('💔 Payment modal closed by admin');
          }
        }
      };

      return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window.Razorpay as any)({
          ...razorpayOptions,
          handler: (response: RazorpayResponse) => {
            console.log('✅ Payment successful!', response);
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          }
        });

        // Handle payment failures
        rzp.on('payment.failed', (response: RazorpayError) => {
          console.error('❌ Payment failed:', response.error);
          resolve({
            success: false,
            error: response.error.description || 'Payment failed'
          });
        });

        // Open payment modal
        rzp.open();
      });

    } catch (error) {
      console.error('💥 Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Verify payment (mock - will be replaced with actual API call)
  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    console.log('🔍 Verifying payment:', { paymentId, orderId, signature });
    
    // Simulate API call to backend for verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock verification - always return true for demo
    return true;
  }
}

// Export singleton instance
export const adminRazorpayService = new AdminRazorpayService();

export default adminRazorpayService;