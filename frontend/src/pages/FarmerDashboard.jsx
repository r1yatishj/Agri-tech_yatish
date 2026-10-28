import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Trees,
  Wheat,
  Activity,
  CloudSun,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  Plus,
  Droplets,
  Thermometer,
  ShieldAlert,
  Clock,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [farmsRes, cropsRes, weatherRes, alertsRes, ordersRes] = await Promise.all([
          api.get('/farms').catch(() => ({ data: { data: [] } })),
          api.get('/crops').catch(() => ({ data: { data: [] } })),
          api.get('/weather').catch(() => ({ data: { data: null } })),
          api.get('/weather/alerts').catch(() => ({ data: { data: [] } })),
          api.get('/orders/my').catch(() => ({ data: { data: [] } })),
        ]);

        setFarms(farmsRes.data.data || []);
        setCrops(cropsRes.data.data || []);
        setWeather(weatherRes.data.data || null);
        setAlerts(alertsRes.data.data || []);
        setOrders(ordersRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">{t('loading')}</p>
      </div>
    );
  }

  const primaryCrop = crops[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/50 text-[11px] font-bold text-emerald-200 border border-emerald-600/60">
            <span>🌾 {user?.location || 'Rajasthan Agrarian Belt'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('welcome')}, {user?.name || 'Kisan Mitra'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Here is your daily farm diagnostic briefing. Monitor soil nutrients, track crop growth milestones, and view microclimate pest advisories.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/farms"
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNewFarm')}</span>
          </Link>
          <Link
            to="/crops"
            className="px-4 py-2.5 rounded-xl bg-emerald-600/90 text-white hover:bg-emerald-600 text-xs font-bold border border-emerald-400 shadow-md transition-all flex items-center gap-1.5"
          >
            <Wheat className="w-4 h-4" />
            <span>{t('addCrop')}</span>
          </Link>
          <Link
            to="/soil-analytics"
            className="px-4 py-2.5 rounded-xl bg-emerald-900/60 text-white hover:bg-emerald-900 text-xs font-bold border border-emerald-500 shadow-md transition-all flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" />
            <span>{t('testSoil')}</span>
          </Link>
        </div>
      </div>

      {/* Climate / Pest Warning Alert Strip (If active alerts exist) */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Microclimate Pest Alert: {alerts[0].identifiedThreat || 'High Humidity Advisory'}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800">
                  {alerts[0].pestRiskLevel} Risk
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {alerts[0].advisoryMessage}
              </p>
            </div>
          </div>
          <Link
            to="/weather"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
          >
            Read Action Advisory
          </Link>
        </div>
      )}

      {/* 4 Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">{t('activeFarms')}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{farms.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {farms.reduce((sum, f) => sum + (f.sizeAcres || 0), 0)} Total Acres
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Trees className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">{t('cropsMonitored')}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{crops.length}</p>
            <p className="text-[11px] text-green-600 font-medium mt-0.5">Active Growth Cycle</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
            <Wheat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Soil Health Grade</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {primaryCrop ? primaryCrop.healthStatus : 'Optimal'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              NPK Telemetry Active
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Climate Status</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {weather ? `${weather.temperatureC}°C` : '31°C'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {weather ? weather.condition : 'Partly Cloudy'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <CloudSun className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Crop Monitoring & Soil Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: Active Crops & Growth Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Crop Growth & Stages</h3>
                <p className="text-xs text-slate-500">Real-time physiological progress across farms</p>
              </div>
              <Link
                to="/crops"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Manage Crops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {crops.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Wheat className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No active crops registered yet.</p>
                <Link
                  to="/crops"
                  className="inline-block text-xs font-bold text-emerald-600 hover:underline"
                >
                  Register your first crop
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {crops.map((crop) => (
                  <div
                    key={crop._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          🌱
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{crop.cropName}</h4>
                          <p className="text-[11px] text-slate-500">
                            Variety: {crop.variety} • Planted:{' '}
                            {new Date(crop.plantingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          crop.healthStatus === 'Healthy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : crop.healthStatus === 'Attention Needed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {crop.healthStatus}
                      </span>
                    </div>

                    {/* Stage Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>Current Stage: {crop.stages?.currentStage || 'Vegetative'}</span>
                        <span className="text-emerald-700 font-bold">
                          {crop.stages?.stageProgressPercent || 50}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${crop.stages?.stageProgressPercent || 50}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* NPK telemetry mini bar */}
                    {crop.soilHealth && (
                      <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px]">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400">N:</span>{' '}
                          <span className="font-bold text-slate-700">{crop.soilHealth.nitrogen} mg</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400">P:</span>{' '}
                          <span className="font-bold text-slate-700">{crop.soilHealth.phosphorus} mg</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400">K:</span>{' '}
                          <span className="font-bold text-slate-700">{crop.soilHealth.potassium} mg</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400">pH:</span>{' '}
                          <span className="font-bold text-slate-700">{crop.soilHealth.ph}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Soil Recommendation Banner */}
          {primaryCrop?.soilHealth?.aiRecommendation && (
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Agronomic Soil AI Advisory ({primaryCrop.cropName})
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {primaryCrop.soilHealth.aiRecommendation}
                </p>
                <div className="pt-2">
                  <Link
                    to="/soil-analytics"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Open Deep Soil Analytics & NPK Charts →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Columns: Microclimate Widget & Recent Orders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Microclimate Weather Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Microclimate Radar
                </h3>
              </div>
              <Link to="/weather" className="text-xs text-emerald-700 font-bold hover:underline">
                5-Day
              </Link>
            </div>

            <div className="text-center py-2 space-y-1">
              <p className="text-3xl font-extrabold text-slate-900">
                {weather?.temperatureC || 31}°C
              </p>
              <p className="text-xs text-slate-500">{weather?.condition || 'Partly Cloudy'}</p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Feels like {weather?.feelsLikeC || 34}°C • {weather?.region || 'Kota Agrarian Belt'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Humidity</p>
                  <p className="font-bold text-slate-700">{weather?.humidityPercent || 78}%</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Wind Speed</p>
                  <p className="font-bold text-slate-700">{weather?.windSpeedKmh || 14} km/h</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <p className="font-bold text-slate-800">Irrigation Timing:</p>
              <p className="mt-0.5">{weather?.irrigationAdvisory || 'Optimal watering: 05:30 AM - 08:30 AM'}</p>
            </div>
          </div>

          {/* Recent Orders Widget */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Agri Supplies Orders
                </h3>
              </div>
              <Link to="/orders" className="text-xs text-emerald-700 font-bold hover:underline">
                View All
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-500">No recent supply orders.</p>
                <Link
                  to="/marketplace"
                  className="inline-block text-xs font-bold text-emerald-600 hover:underline"
                >
                  Browse certified seeds & fertilizers
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {order.items?.length || 1} Item(s) • ₹{order.totalAmount}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {order.items?.map((i) => i.name).join(', ')}
                    </p>
                    <Link
                      to="/orders"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pt-0.5"
                    >
                      <span>Track Shipment</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
