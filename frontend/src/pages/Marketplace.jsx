import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  CheckCircle,
  Truck,
  Package,
  Plus,
  Minus,
  Trash2,
  Clock,
  ShieldCheck,
  Star
} from 'lucide-react';

const Marketplace = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal
  } = useCart();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'cart' | 'orders'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Checkout address form
  const [shippingForm, setShippingForm] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '+91 98765 43210',
    village: user?.location?.village || 'Murthal',
    district: user?.location?.district || 'Sonipat',
    state: user?.location?.state || 'Haryana',
    pincode: '131027',
    paymentMethod: 'Cash on Delivery'
  });

  const [orderSuccess, setOrderSuccess] = useState(null);

  const categories = [
    'All',
    'Seeds & Saplings',
    'Bio-Fertilizers & Nutrients',
    'Organic Pest Solutions',
    'Smart Irrigation & Tools',
    'Soil Testing Kits'
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/resources', {
        params: {
          category: selectedCategory,
          search: searchQuery
        }
      });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching marketplace resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          resourceId: item._id,
          quantity: item.quantity
        })),
        paymentMethod: shippingForm.paymentMethod,
        shippingAddress: {
          recipientName: shippingForm.recipientName,
          phone: shippingForm.phone,
          village: shippingForm.village,
          district: shippingForm.district,
          state: shippingForm.state,
          pincode: shippingForm.pincode
        }
      };

      const res = await axios.post('/api/orders', orderPayload);
      setOrderSuccess(res.data.data);
      clearCart();
      setActiveTab('orders');
    } catch (err) {
      alert('Failed to place order: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header and View Selector */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-success mb-1">{t('marketplaceTitle')}</h3>
          <p className="text-muted small mb-0">{t('marketplaceSubtitle')}</p>
        </div>
        <div className="btn-group bg-white rounded-3 shadow-sm p-1">
          <button
            className={`btn btn-sm ${activeTab === 'catalog' ? 'btn-success fw-bold' : 'btn-light'}`}
            onClick={() => setActiveTab('catalog')}
          >
            <ShoppingBag size={16} className="me-1" /> Catalog
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'cart' ? 'btn-success fw-bold' : 'btn-light'}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingCart size={16} className="me-1" /> {t('cart')} ({cartItems.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-success fw-bold' : 'btn-light'}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} className="me-1" /> {t('myOrders')}
          </button>
        </div>
      </div>

      {/* VIEW 1: Catalog */}
      {activeTab === 'catalog' && (
        <div>
          {/* Search & Categories Bar */}
          <div className="card-custom p-3 mb-4 bg-white">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <form onSubmit={handleSearchSubmit} className="d-flex">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('searchInputs')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-agri" type="submit">
                      <Search size={16} />
                    </button>
                  </div>
                </form>
              </div>
              <div className="col-md-7">
                <div className="d-flex flex-wrap gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`btn btn-sm ${
                        selectedCategory === cat ? 'btn-success text-white fw-bold' : 'btn-outline-secondary'
                      } rounded-pill px-3`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-5 text-muted">Loading agricultural supplies...</div>
          ) : products.length === 0 ? (
            <div className="card-custom p-5 text-center bg-white">
              <ShoppingBag size={48} className="text-muted mb-2 opacity-50" />
              <h6>No products found matching your filter.</h6>
              <button className="btn btn-sm btn-agri mt-2" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {products.map((item) => (
                <div key={item._id} className="col-sm-6 col-lg-4 col-xl-3">
                  <div className="card-custom h-100 d-flex flex-column bg-white overflow-hidden">
                    <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-100 h-100 object-fit-cover"
                      />
                      <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-2">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex align-items-center gap-1 text-warning small mb-1">
                        <Star size={14} fill="#eab308" />
                        <span className="fw-bold">{item.rating || 4.8}</span>
                        <span className="text-muted">({item.brand})</span>
                      </div>

                      <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                      <p className="text-muted small flex-grow-1 mb-2" style={{ fontSize: '0.82rem' }}>
                        {item.description}
                      </p>

                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {item.suitableForCrops?.slice(0, 2).map((crop, i) => (
                          <span key={i} className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                            🌱 {crop}
                          </span>
                        ))}
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                        <div>
                          <span className="fs-5 fw-bold text-success">₹{item.price}</span>
                          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>per {item.unit}</small>
                        </div>
                        <button
                          className="btn btn-sm btn-agri d-flex align-items-center gap-1"
                          onClick={() => addToCart(item, 1)}
                        >
                          <ShoppingCart size={15} /> {t('addToCart')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Shopping Cart & Checkout */}
      {activeTab === 'cart' && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card-custom p-4 bg-white">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <ShoppingCart size={20} className="text-success" /> {t('cart')} ({cartItems.length} items)
              </h5>

              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <ShoppingCart size={48} className="text-muted mb-2 opacity-50" />
                  <p className="text-muted">{t('cartEmpty')}</p>
                  <button className="btn btn-sm btn-agri" onClick={() => setActiveTab('catalog')}>
                    Browse Agri Catalog
                  </button>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {cartItems.map((item) => (
                    <div key={item._id} className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between gap-3">
                      <img src={item.image} alt={item.name} className="rounded-3" width="60" height="60" style={{ objectFit: 'cover' }} />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0">{item.name}</h6>
                        <small className="text-muted">₹{item.price} / {item.unit}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-sm btn-light border p-1" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span className="fw-bold px-2">{item.quantity}</span>
                        <button className="btn btn-sm btn-light border p-1" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-end" style={{ width: '90px' }}>
                        <span className="fw-bold text-success d-block">₹{item.price * item.quantity}</span>
                        <button className="btn btn-link text-danger p-0 border-0 small" onClick={() => removeFromCart(item._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                    <button className="btn btn-sm btn-outline-danger" onClick={clearCart}>
                      Clear Cart
                    </button>
                    <div className="text-end">
                      <span className="text-muted small">{t('total')}: </span>
                      <span className="fs-4 fw-bold text-success">₹{getCartTotal()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Address Form */}
          {cartItems.length > 0 && (
            <div className="col-lg-5">
              <div className="card-custom p-4 bg-white">
                <h5 className="fw-bold mb-3">{t('deliveryAddress')}</h5>
                <form onSubmit={handlePlaceOrder}>
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Farmer / Recipient Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={shippingForm.recipientName}
                      onChange={(e) => setShippingForm({ ...shippingForm, recipientName: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Contact Mobile Number *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Village / Gram</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={shippingForm.village}
                        onChange={(e) => setShippingForm({ ...shippingForm, village: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">District</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={shippingForm.district}
                        onChange={(e) => setShippingForm({ ...shippingForm, district: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">State</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Postal Pincode</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={shippingForm.pincode}
                        onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold">{t('paymentMethod')}</label>
                    <select
                      className="form-select form-select-sm"
                      value={shippingForm.paymentMethod}
                      onChange={(e) => setShippingForm({ ...shippingForm, paymentMethod: e.target.value })}
                    >
                      <option value="Cash on Delivery">Cash on Delivery (Pay upon arrival)</option>
                      <option value="UPI / Online Transfer">UPI / Online Transfer</option>
                      <option value="Kisan Credit Card">Kisan Credit Card (Subsidized Credit)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-agri w-100 py-2 fw-bold">
                    {t('placeOrderBtn')} • ₹{getCartTotal()}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: My Orders */}
      {activeTab === 'orders' && (
        <div className="card-custom p-4 bg-white">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Package size={20} className="text-success" /> {t('myOrders')} ({orders.length})
          </h5>

          {orders.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">You have not placed any input orders yet.</p>
              <button className="btn btn-sm btn-agri" onClick={() => setActiveTab('catalog')}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {orders.map((ord) => (
                <div key={ord._id} className="col-lg-6">
                  <div className="border rounded-3 p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                      <div>
                        <span className="small text-muted d-block">Order #{ord._id.slice(-6).toUpperCase()}</span>
                        <small className="text-secondary">{new Date(ord.createdAt).toLocaleString()}</small>
                      </div>
                      <span className={`badge ${
                        ord.orderStatus === 'Delivered' ? 'bg-success' :
                        ord.orderStatus === 'Dispatched' ? 'bg-info text-dark' :
                        ord.orderStatus === 'Approved' ? 'bg-primary' : 'bg-warning text-dark'
                      } px-2 py-1`}>
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="small fw-bold text-muted d-block mb-1">ITEMS ORDERED:</span>
                      {ord.items?.map((it, i) => (
                        <div key={i} className="d-flex justify-content-between small text-dark">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="fw-semibold">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <small className="text-muted">Payment: <strong>{ord.paymentMethod}</strong></small>
                      <strong className="text-success fs-6">Total: ₹{ord.totalAmount}</strong>
                    </div>

                    {/* Timeline */}
                    {ord.statusTimeline?.length > 0 && (
                      <div className="mt-2 pt-2 border-top small text-muted">
                        <Clock size={12} className="me-1" />
                        Latest Update: {ord.statusTimeline[ord.statusTimeline.length - 1].status} ({new Date(ord.statusTimeline[ord.statusTimeline.length - 1].timestamp).toLocaleDateString()})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
