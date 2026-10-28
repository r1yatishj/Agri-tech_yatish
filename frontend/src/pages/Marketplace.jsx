import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Star,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  'All',
  'Seeds',
  'Bio-Fertilizers',
  'Pest Control',
  'Irrigation & Tools',
  'Soil Amendments',
];

const Marketplace = ({ onOpenCart }) => {
  const { t } = useLanguage();
  const { addToCart } = useAuth();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedItemName, setAddedItemName] = useState('');

  const fetchProducts = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/products', { params });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedItemName(product.name);
    setTimeout(() => setAddedItemName(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-xs font-bold text-emerald-300 border border-emerald-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Certified Agricultural Inputs Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Direct Kisan Agri-Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Purchase certified high-yield seeds, microbial bio-fertilizers, botanical pest repellents, and digital soil sensor kits with doorstep farm delivery.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs space-y-2 shrink-0">
          <div className="flex items-center gap-2 font-bold text-emerald-200">
            <CreditCard className="w-4 h-4" />
            <span>Kisan Credit Card (KCC) Ready</span>
          </div>
          <p className="text-slate-200">Zero-interest payment option on seasonal seed & fertilizer bookings.</p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-300">
            <Truck className="w-3.5 h-3.5" />
            <span>Free Agricultural Distribution Hub Delivery</span>
          </div>
        </div>
      </div>

      {/* Added to cart toast notification */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Added "{addedItemName}" to Cart!</span>
          <button
            type="button"
            onClick={onOpenCart}
            className="ml-2 px-2.5 py-1 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 font-bold"
          >
            Checkout
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seeds, neem oil, soil tester, fertilizers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            Showing <span className="font-bold text-slate-900">{products.length}</span> Verified Products
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading marketplace catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Matching Agricultural Inputs</h3>
          <p className="text-xs text-slate-500">Try altering your search keywords or choosing another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Product Image & Badge */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/95 text-emerald-800 shadow-sm border border-emerald-100">
                      ★ {product.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white">
                    {product.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{product.rating || 4.8}</span>
                    <span className="text-slate-400 text-[11px]">({product.reviewCount || 24} reviews)</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <p className="text-[11px] text-slate-400 font-medium">
                    Package Unit: <span className="text-slate-700 font-semibold">{product.unit}</span>
                  </p>
                </div>
              </div>

              {/* Price & Add to Cart Action */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Kisan Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-slate-900">₹{product.price}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Incl. GST</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
