import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

// Admin Dashboard Components
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // In a real app, you would have an endpoint for dashboard stats
        // For now, we'll fetch products, orders, and users separately
        const productsRes = await axios.get('http://localhost:5000/api/products');
        const ordersRes = await axios.get('http://localhost:5000/api/orders');
        const usersRes = await axios.get('http://localhost:5000/api/auth/users');

        const totalRevenue = ordersRes.data.reduce((sum, order) => {
          if (order.paymentStatus === 'completed') {
            return sum + order.totalAmount;
          }
          return sum;
        }, 0);

        setStats({
          totalProducts: productsRes.data.products.length,
          totalOrders: ordersRes.data.length,
          totalUsers: usersRes.data.length,
          revenue: totalRevenue
        });

        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon products-icon">
            <i className="fas fa-pills"></i>
          </div>
          <div className="stat-details">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orders-icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon users-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-details">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon revenue-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-details">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="recent-orders">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className="view-all">View All</Link>
        </div>
        
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.substring(order._id.length - 8)}</td>
                  <td>{order.user.name}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
        toast.success(`${name} deleted successfully`);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-management">
      <div className="section-header">
        <h2>Products Management</h2>
        <button 
          className="add-btn"
          onClick={() => navigate('/admin/products/add')}
        >
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>
      
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  <img src={product.image} alt={product.name} className="product-thumbnail" />
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td className="actions-cell">
                  <button 
                    className="edit-btn"
                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(product._id, product.name)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: '',
    manufacturer: '',
    dosage: '',
    sideEffects: '',
    prescriptionRequired: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit/');
  const productId = isEditMode ? location.pathname.split('/').pop() : null;

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/products/${productId}`);
          const product = res.data;
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category,
            stock: product.stock,
            manufacturer: product.manufacturer || '',
            dosage: product.dosage || '',
            sideEffects: product.sideEffects ? product.sideEffects.join(', ') : '',
            prescriptionRequired: product.prescriptionRequired || false
          });
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error('Failed to load product details');
          navigate('/admin/products');
        }
      };

      fetchProduct();
    }
  }, [isEditMode, productId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sideEffects: formData.sideEffects ? formData.sideEffects.split(',').map(item => item.trim()) : []
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/products/${productId}`, productData);
        toast.success('Product updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/products', productData);
        toast.success('Product added successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="manufacturer">Manufacturer</label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dosage">Dosage</label>
          <input
            type="text"
            id="dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="sideEffects">Side Effects (comma separated)</label>
          <input
            type="text"
            id="sideEffects"
            name="sideEffects"
            value={formData.sideEffects}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="prescriptionRequired"
            name="prescriptionRequired"
            checked={formData.prescriptionRequired}
            onChange={handleChange}
          />
          <label htmlFor="prescriptionRequired">Prescription Required</label>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/products')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { orderStatus: newStatus });
      
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          return { ...order, orderStatus: newStatus };
        }
        return order;
      }));
      
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-management">
      <h2>Orders Management</h2>
      
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>#{order._id.substring(order._id.length - 8)}</td>
                <td>{order.user.name}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.items.length} items</td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="actions-cell">
                  <select 
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/auth/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users-management">
      <h2>Users Management</h2>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.orderCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const location = useLocation();
  
  return (
    <div className="admin-dashboard-container">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
          <Link 
            to="/admin/products" 
            className={`admin-nav-link ${location.pathname.includes('/admin/products') ? 'active' : ''}`}
          >
            <i className="fas fa-pills"></i> Products
          </Link>
          <Link 
            to="/admin/orders" 
            className={`admin-nav-link ${location.pathname === '/admin/orders' ? 'active' : ''}`}
          >
            <i className="fas fa-shopping-bag"></i> Orders
          </Link>
          <Link 
            to="/admin/users" 
            className={`admin-nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <i className="fas fa-users"></i> Users
          </Link>
        </nav>
      </div>
      
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/add" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/users" element={<UsersList />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
