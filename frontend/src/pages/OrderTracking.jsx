import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const STAGES = [
  'Order Placed',
  'Confirmed & Packed',
  'In Transit / Shipped',
  'Out for Delivery',
  'Delivered',
];

const OrderTracking = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Loading your agricultural orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agricultural Supplies & Order Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time milestone tracking from seed quality certification to farm gate handover
          </p>
        </div>

        <Link
          to="/marketplace"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          Browse Marketplace
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center max-w-md mx-auto border border-slate-200 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Need seeds, bio-stimulants, or soil test meters? Order directly through the Agri-Marketplace.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md"
          >
            <span>Procure Agri Inputs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6"
            >
              {/* Order Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      ID: {order._id}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Status: {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 block">Total Invoice</span>
                  <span className="text-xl font-black text-slate-900">₹{order.totalAmount}</span>
                  <span className="text-[11px] text-emerald-700 block font-semibold">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Multi-Stage Visual Tracking Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Live Dispatch & Delivery Timeline
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                  {order.trackingTimeline && order.trackingTimeline.length > 0 ? (
                    order.trackingTimeline.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                          item.completed
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase">Step {idx + 1}</span>
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                        <p className={`font-bold text-xs ${item.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                          {item.stage}
                        </p>
                        <p className="text-[10px] leading-tight text-slate-500">{item.detail}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Timeline initializing...</p>
                  )}
                </div>
              </div>

              {/* Items in Consignment & Shipping Address */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-slate-100">
                {/* Consignment Items */}
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Consignment Items ({order.items?.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400">Qty: {item.quantity} • {item.unit || '1 Unit'}</p>
                        </div>
                        <span className="font-extrabold text-slate-800">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Destination Box */}
                <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivery Farm Destination</span>
                  </h4>
                  <div className="text-slate-600 leading-snug">
                    <p className="font-bold text-slate-800">{order.shippingAddress?.fullName}</p>
                    <p>{order.shippingAddress?.street}</p>
                    <p>
                      {order.shippingAddress?.villageOrCity}, {order.shippingAddress?.state} -{' '}
                      {order.shippingAddress?.pincode}
                    </p>
                    <p className="font-semibold text-emerald-800 mt-1">
                      Phone: {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
