import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products?limit=4');
        setFeaturedProducts(res.data.products);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Medley Pharma</h1>
          <p>Your trusted online pharmacy for all your healthcare needs</p>
          <Link to="/products" className="shop-now-btn">Shop Now</Link>
        </div>
      </section>

      <section className="features-section">
        <div className="feature">
          <i className="fas fa-truck"></i>
          <h3>Fast Delivery</h3>
          <p>Get your medicines delivered to your doorstep</p>
        </div>
        <div className="feature">
          <i className="fas fa-shield-alt"></i>
          <h3>Secure Payments</h3>
          <p>Multiple secure payment options available</p>
        </div>
        <div className="feature">
          <i className="fas fa-certificate"></i>
          <h3>Quality Assurance</h3>
          <p>All products are quality checked and verified</p>
        </div>
        <div className="feature">
          <i className="fas fa-headset"></i>
          <h3>24/7 Support</h3>
          <p>Customer support available round the clock</p>
        </div>
      </section>

      <section className="featured-products">
        <h2>Featured Products</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product._id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <Link to={`/products/${product._id}`} className="view-product-btn">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all-container">
          <Link to="/products" className="view-all-btn">View All Products</Link>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>About Medley Pharma</h2>
          <p>
            Medley Pharma is a versatile and dynamic software tool designed to simplify the process of creating and managing online forms. With its intuitive interface and powerful features, Medley Pharma empowers users to build customized forms for various purposes, such as surveys, registrations, feedback collection, and more.
          </p>
          <p>
            Our platform prioritizes data security and privacy, providing options for adding CAPTCHA verification, SSL encryption, and form submission limits to protect against spam and ensure the integrity of the data collected.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
