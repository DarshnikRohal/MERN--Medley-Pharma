import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
        fetchRelatedProducts(res.data.category);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchRelatedProducts = async (category) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products?category=${category}&limit=4`);
      // Filter out the current product from related products
      const filtered = res.data.products.filter(item => item._id !== id);
      setRelatedProducts(filtered.slice(0, 3)); // Show at most 3 related products
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`);
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="error-message">Product not found</div>;
  }

  return (
    <div className="product-details-container">
      <div className="product-details">
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-detail-image" />
        </div>
        
        <div className="product-info-container">
          <h1>{product.name}</h1>
          
          <p className="product-price">${product.price.toFixed(2)}</p>
          
          <div className="product-status">
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          {product.manufacturer && (
            <div className="product-manufacturer">
              <h3>Manufacturer</h3>
              <p>{product.manufacturer}</p>
            </div>
          )}
          
          {product.dosage && (
            <div className="product-dosage">
              <h3>Dosage</h3>
              <p>{product.dosage}</p>
            </div>
          )}
          
          {product.sideEffects && product.sideEffects.length > 0 && (
            <div className="product-side-effects">
              <h3>Side Effects</h3>
              <ul>
                {product.sideEffects.map((effect, index) => (
                  <li key={index}>{effect}</li>
                ))}
              </ul>
            </div>
          )}
          
          {product.prescriptionRequired && (
            <div className="prescription-required">
              <p><strong>Note:</strong> This product requires a prescription</p>
            </div>
          )}
          
          <div className="product-actions">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-input-group">
                <button 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  id="quantity" 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stock}
                />
                <button 
                  onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct._id} className="related-product-card">
                <img src={relatedProduct.image} alt={relatedProduct.name} className="related-product-image" />
                <div className="related-product-info">
                  <h3>{relatedProduct.name}</h3>
                  <p className="related-product-price">${relatedProduct.price.toFixed(2)}</p>
                  <Link to={`/products/${relatedProduct._id}`} className="view-product-btn">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
