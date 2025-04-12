import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, calculateTotal } = useCart();

  const handleQuantityChange = (productId, quantity) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="continue-shopping-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-header">
            <div className="cart-header-product">Product</div>
            <div className="cart-header-price">Price</div>
            <div className="cart-header-quantity">Quantity</div>
            <div className="cart-header-total">Total</div>
            <div className="cart-header-actions">Actions</div>
          </div>
          
          {cart.map(item => (
            <div key={item.product._id} className="cart-item">
              <div className="cart-item-product">
                <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-category">{item.product.category}</p>
                </div>
              </div>
              
              <div className="cart-item-price">${item.product.price.toFixed(2)}</div>
              
              <div className="cart-item-quantity">
                <div className="quantity-input-group">
                  <button 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value) || 1)}
                    min="1"
                    max={item.product.stock}
                  />
                  <button 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="cart-item-total">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
              
              <div className="cart-item-actions">
                <button 
                  className="remove-item-btn"
                  onClick={() => handleRemoveItem(item.product._id, item.product.name)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          
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
          
          <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
          <Link to="/products" className="continue-shopping-link">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
