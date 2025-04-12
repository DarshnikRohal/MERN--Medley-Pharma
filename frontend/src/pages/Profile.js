import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's an order ID in the query params
    const params = new URLSearchParams(location.search);
    const orderId = params.get('order');
    if (orderId) {
      setActiveTab('orders');
    }

    fetchOrders();
  }, [location.search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await axios.put('http://localhost:5000/api/auth/profile', {
        name: profileData.name,
        email: profileData.email,
        password: profileData.password || undefined
      });
      toast.success('Profile updated successfully');
      setProfileData({ ...profileData, password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/address', newAddress);
      setAddresses(res.data.addresses);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button
            className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <i className="fas fa-shopping-bag"></i> Orders
          </button>
          <button
            className={`profile-tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => handleTabChange('addresses')}
          >
            <i className="fas fa-map-marker-alt"></i> Addresses
          </button>
          <button className="profile-tab logout-tab" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>My Profile</h2>
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={profileData.password}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={handleProfileChange}
                />
              </div>

              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>My Orders</h2>
            {loading ? (
              <div className="loading">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="no-orders">
                <p>You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/products')} className="shop-now-btn">
                  Shop Now
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order._id.substring(order._id.length - 8)}</h3>
                        <p className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`order-status ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="order-item-image" 
                          />
                          <div className="order-item-details">
                            <h4>{item.product.name}</h4>
                            <p>Quantity: {item.quantity}</p>
                            <p className="order-item-price">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        <span>Total:</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                      {order.orderStatus === 'processing' && (
                        <button className="cancel-order-btn">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="addresses-section">
            <h2>My Addresses</h2>

            {addresses.length > 0 ? (
              <div className="addresses-list">
                {addresses.map((address, index) => (
                  <div key={index} className="address-card">
                    <div className="address-details">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-addresses">
                <p>You haven't added any addresses yet.</p>
              </div>
            )}

            <div className="add-address">
              <h3>Add New Address</h3>
              <form onSubmit={handleAddressSubmit} className="address-form">
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      required
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
                      value={newAddress.zipCode}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={newAddress.country}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="add-address-btn">Add Address</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
