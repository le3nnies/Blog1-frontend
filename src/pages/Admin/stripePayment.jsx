import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

const PaymentForm = ({ amount, onSuccess }) => {
  //const stripe = useStripe();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    // Send paymentMethod.id to your server
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        amount: amount, // in cents
        currency: 'usd',
      }),
    });

    const { clientSecret, error: serverError } = await response.json();

    if (serverError) {
      console.error('Server error:', serverError);
      return;
    }

    // Confirm payment
    const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

    if (confirmError) {
      console.error('Confirm error:', confirmError);
    } else {
      onSuccess(); // Payment succeeded
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      <button type="submit" disabled={!stripe}>
        Pay ${(amount / 100).toFixed(2)}
      </button>
    </form>
  );
};

// Usage in your component
const CheckoutPage = () => {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <Elements stripe={stripePromise}>
      <div className="checkout-container">
        <h2>Purchase Report</h2>
        <p>Total: $29.99</p>
        
        <button onClick={() => setShowPayment(true)}>
          Buy Now
        </button>

        {showPayment && (
          <PaymentForm 
            amount={2999} 
            onSuccess={() => {
              alert('Payment successful!');
              setShowPayment(false);
            }}
          />
        )}
      </div>
    </Elements>
  );
};