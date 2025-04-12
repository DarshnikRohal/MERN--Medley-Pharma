import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
  const { cart, calculateTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      toast.info('Your cart is empty');
    }
  }, [cart, navigate]);

  const handleShippingInfoChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      // Validate shipping info
      if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode || !shippingInfo.country) {
        toast.error('Please fill in all shipping information');
        return;
      }
    }
    setActiveStep(activeStep + 1);
  };

  const handlePreviousStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      const res = await axios.post('http://localhost:5000/api/orders', {
        items: orderItems,
        shippingAddress: shippingInfo,
        totalAmount: calculateTotal()
      });

      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/profile?order=${res.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-steps">
        <div className={`checkout-step ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Shipping</div>
        </div>
        <div className="step-connector"></div>
        <div className={`checkout-step ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Payment</div>
        </div>
        <div className="step-connector"></div>
        <div className={`checkout-step ${activeStep === 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Review</div>
        </div>
      </div>
      
      <div className="checkout-content">
        {activeStep === 1 && (
          <div className="shipping-step">
            <h2>Shipping Information</h2>
            <form className="shipping-form">
              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={shippingInfo.street}
                  onChange={handleShippingInfoChange}
                  required
                  placeholder="Enter your street address"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingInfoChange}
                    required
                    placeholder="Enter your city"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingInfoChange}
                    required
                    placeholder="Enter your state"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingInfoChange}
                    required
                    placeholder="Enter your zip code"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingInfoChange}
                    required
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </form>
            
            <div className="step-actions">
              <button onClick={() => navigate('/cart')} className="back-btn">Back to Cart</button>
              <button onClick={handleNextStep} className="next-btn">Continue to Payment</button>
            </div>
          </div>
        )}
        
        {activeStep === 2 && (
          <div className="payment-step">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <div className="payment-option">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="card">
                  <i className="far fa-credit-card"></i>
                  Credit / Debit Card
                </label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="paypal">
                  <i className="fab fa-paypal"></i>
                  PayPal
                </label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="cod">
                  <i className="fas fa-money-bill-wave"></i>
                  Cash on Delivery
                </label>
              </div>
            </div>
            
            {paymentMethod === 'card' && (
              <div className="card-details">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="nameOnCard">Name on Card</label>
                  <input
                    type="text"
                    id="nameOnCard"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            <div className="step-actions">
              <button onClick={handlePreviousStep} className="back-btn">Back to Shipping</button>
              <button onClick={handleNextStep} className="next-btn">Review Order</button>
            </div>
          </div>
        )}
        
        {activeStep === 3 && (
          <div className="review-step">
            <h2>Review Your Order</h2>
            
            <div className="review-section">
              <h3>Items</h3>
              <div className="review-items">
                {cart.map(item => (
                  <div key={item.product._id} className="review-item">
                    <img src={item.product.image} alt={item.product.name} className="review-item-image" />
                    <div className="review-item-details">
                      <h4>{item.product.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p className="review-item-price">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="review-section">
              <h3>Shipping Address</h3>
              <div className="review-address">
                <p>{user?.name}</p>
                <p>{shippingInfo.street}</p>
                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                <p>{shippingInfo.country}</p>
              </div>
            </div>
            
            <div className="review-section">
              <h3>Payment Method</h3>
              <div className="review-payment">
                {paymentMethod === 'card' && <p><i className="far fa-credit-card"></i> Credit / Debit Card</p>}
                {paymentMethod === 'paypal' && <p><i className="fab fa-paypal"></i> PayPal</p>}
                {paymentMethod === 'cod' && <p><i className="fas fa-money-bill-wave"></i> Cash on Delivery</p>}
              </div>
            </div>
            
            <div className="review-section">
              <h3>Order Summary</h3>
              <div className="review-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="step-actions">
              <button onClick={handlePreviousStep} className="back-btn">Back to Payment</button>
              <button 
                onClick={handlePlaceOrder} 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="order-summary">
        <h2>Order Summary</h2>
        
        <div className="summary-items">
          {cart.map(item => (
            <div key={item.product._id} className="summary-item">
              <div className="summary-item-info">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="summary-totals">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          
          <div className="summary-row total">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
