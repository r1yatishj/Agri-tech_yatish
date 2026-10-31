import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Trees,
  Sprout,
  FlaskConical,
  AlertTriangle,
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Sparkles,
  Stethoscope
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [farmRes, cropRes, weatherRes] = await Promise.all([
          axios.get('/api/farms'),
          axios.get('/api/crops'),
          axios.get('/api/weather/forecast')
        ]);
        setFarms(farmRes.data.data || []);
        setCrops(cropRes.data.data || []);
        setWeatherData(weatherRes.data.data || null);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalAcreage = farms.reduce((acc, f) => acc + (f.totalArea?.value || 0), 0);
  const activeAlert = weatherData?.pestAlert?.alertActive ? weatherData.pestAlert : null;

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Emergency Pest Alert Notification Banner */}
      {activeAlert && (
        <div className="alert alert-warning border-0 shadow-sm rounded-4 p-3 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center">
              <AlertOctagon size={24} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger text-uppercase px-2 py-1">{activeAlert.riskLevel} {t('riskLevel')}</span>
                <h6 className="mb-0 fw-bold text-dark">{activeAlert.pestName}</h6>
              </div>
              <p className="mb-0 small text-secondary mt-1">
                <strong>{t('affectedCrops')}:</strong> {activeAlert.affectedCrops?.join(', ')} — {activeAlert.preventionAdvice}
              </p>
            </div>
          </div>
          <Link to="/weather" className="btn btn-sm btn-dark text-nowrap rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-1">
            {t('viewDetails')} <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="hero-banner shadow-sm mb-4">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white text-success fw-bold px-2 py-1 rounded-pill">
                🌱 {user?.role === 'admin' ? 'Agronomy Control Center' : 'Smart Kisan Portal'}
              </span>
              <span className="badge bg-success-subtle text-white border border-light-subtle rounded-pill">
                📍 {user?.location?.district ? `${user.location.district}, ${user.location.state}` : 'North Agri Region'}
              </span>
            </div>
            <h2 className="fw-extrabold mb-2 text-white">
              {t('welcomeBack')}, {user?.name}!
            </h2>
            <p className="text-white-50 mb-4 fs-6" style={{ maxWidth: '650px' }}>
              {t('farmerSubtitle')}
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/farms" className="btn btn-light text-success fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1">
                <PlusCircle size={18} /> {t('addFarm')}
              </Link>
              <Link to="/soil" className="btn btn-outline-light fw-semibold px-3 py-2 rounded-3 d-flex align-items-center gap-1">
                <FlaskConical size={18} /> {t('testSoil')}
              </Link>
              <Link to="/marketplace" className="btn btn-outline-light fw-semibold px-3 py-2 rounded-3 d-flex align-items-center gap-1">
                🛒 {t('navMarketplace')}
              </Link>
            </div>
          </div>
          <div className="col-lg-4 d-none d-lg-block text-end pe-4">
            <div className="p-3 bg-white bg-opacity-10 backdrop-blur rounded-4 border border-white border-opacity-25 text-start inline-block">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-white-50">{t('weatherSnapshot')}</span>
                <CloudSun size={20} className="text-warning" />
              </div>
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="fw-bold text-white mb-0">{weatherData?.currentWeather?.temperature || 28}°C</h1>
                <span className="text-white small fw-medium">{weatherData?.currentWeather?.condition || 'Partly Cloudy'}</span>
              </div>
              <div className="row g-2 mt-2 pt-2 border-top border-white border-opacity-25 text-white small">
                <div className="col-6 d-flex align-items-center gap-1">
                  <Droplets size={14} className="text-info" /> {weatherData?.currentWeather?.humidity || 62}% {t('humidity')}
                </div>
                <div className="col-6 d-flex align-items-center gap-1">
                  <Wind size={14} className="text-light" /> {weatherData?.currentWeather?.windSpeed || 14} km/h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card-custom p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="metric-label">{t('totalFarms')}</span>
              <div className="p-2 bg-success-subtle text-success rounded-3">
                <Trees size={20} />
              </div>
            </div>
            <div className="metric-value">{farms.length}</div>
            <span className="text-muted small">
              {totalAcreage.toFixed(1)} {t('acres')} {t('totalArea')}
            </span>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card-custom p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="metric-label">{t('monitoredCrops')}</span>
              <div className="p-2 bg-primary-subtle text-primary rounded-3">
                <Sprout size={20} />
              </div>
            </div>
            <div className="metric-value">{crops.length}</div>
            <span className="text-muted small">
              {crops.filter(c => c.healthStatus === 'Good' || c.healthStatus === 'Excellent').length} in prime health
            </span>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card-custom p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="metric-label">{t('avgSoilHealth')}</span>
              <div className="p-2 bg-warning-subtle text-warning rounded-3">
                <FlaskConical size={20} />
              </div>
            </div>
            <div className="metric-value text-success">84 <small className="fs-6 text-muted">/100</small></div>
            <span className="badge bg-success-subtle text-success">Good Fertility Profile</span>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card-custom p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="metric-label">{t('pestRiskAssessment')}</span>
              <div className="p-2 bg-danger-subtle text-danger rounded-3">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="metric-value text-danger">{activeAlert ? activeAlert.riskLevel : 'Low'}</div>
            <span className="text-muted small">{activeAlert ? activeAlert.pestName : 'No critical pathogens detected'}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="row g-4">
        {/* Left: Active Crops & Farm Status */}
        <div className="col-lg-8">
          <div className="card-custom p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-1">{t('cropsInFarm')}</h5>
                <p className="text-muted small mb-0">Current lifecycle progression and field condition records</p>
              </div>
              <Link to="/farms" className="btn btn-sm btn-agri-outline">
                {t('farmManagement')}
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted">Loading farm records...</div>
            ) : crops.length === 0 ? (
              <div className="text-center py-5">
                <Sprout size={48} className="text-muted mb-2 opacity-50" />
                <h6>{t('noFarmsYet')}</h6>
                <Link to="/farms" className="btn btn-sm btn-agri mt-2">{t('addCrop')}</Link>
              </div>
            ) : (
              <div className="row g-3">
                {crops.map((crop) => (
                  <div key={crop._id} className="col-md-6">
                    <div className="border rounded-3 p-3 bg-light-subtle h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold mb-0 text-success">{crop.cropName}</h6>
                          <small className="text-muted">{crop.variety} • {crop.areaAllocated} {t('acres')}</small>
                        </div>
                        <span className={`badge ${
                          crop.healthStatus === 'Excellent' ? 'badge-health-excellent' :
                          crop.healthStatus === 'Good' ? 'badge-health-good' :
                          crop.healthStatus === 'Needs Attention' ? 'badge-health-attention' : 'badge-health-critical'
                        }`}>
                          {crop.healthStatus}
                        </span>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>{t('stage')}: <strong>{crop.stage}</strong></span>
                          <span>Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: crop.stage === 'Sowing' ? '20%' :
                                     crop.stage === 'Vegetative' ? '45%' :
                                     crop.stage === 'Flowering' ? '70%' :
                                     crop.stage === 'Maturity' ? '90%' : '100%'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="row g-2 text-center small mt-2 pt-2 border-top">
                        <div className="col-4">
                          <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>pH Level</span>
                          <strong>{crop.soilMetrics?.ph || '6.8'}</strong>
                        </div>
                        <div className="col-4">
                          <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Moisture</span>
                          <strong>{crop.soilMetrics?.moisture || '45'}%</strong>
                        </div>
                        <div className="col-4">
                          <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Nitrogen (N)</span>
                          <strong>{crop.soilMetrics?.nitrogen || '280'} kg</strong>
                        </div>
                      </div>

                      <div className="mt-3 text-end">
                        <Link to={`/farms`} className="btn btn-sm btn-link text-success p-0 text-decoration-none fw-semibold">
                          {t('viewCropDetails')} →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Scientific Soil Assessment Teaser */}
          <div className="card-custom p-4 bg-white">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-warning-subtle text-warning-emphasis fw-bold">Scientific Lab Integration</span>
                </div>
                <h5 className="fw-bold mb-1">{t('soilAnalysisTitle')}</h5>
                <p className="text-muted small mb-0">
                  Enter your latest soil test numbers (pH, Nitrogen, Phosphorus, Potassium, Moisture) to automatically balance fertilizer splits and improve crop yields.
                </p>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <Link to="/soil" className="btn btn-agri">
                  {t('testSoil')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Weather Forecast & Agronomy Tools */}
        <div className="col-lg-4">
          {/* 7-Day Forecast Card */}
          <div className="card-custom p-3 mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <CloudSun size={18} className="text-success" /> {t('sevenDayForecast')}
            </h6>
            <div className="list-group list-group-flush small">
              {(weatherData?.forecast || []).map((f, i) => (
                <div key={i} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-light">
                  <div style={{ width: '80px' }}>
                    <strong>{f.day}</strong>
                    <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>{f.date}</span>
                  </div>
                  <span className="text-muted">{f.condition}</span>
                  <div className="text-end">
                    <span className="fw-bold text-dark">{f.maxTemp}°</span> / <span className="text-muted">{f.minTemp}°</span>
                    {f.rainChance > 20 && (
                      <span className="badge bg-info-subtle text-info ms-1" style={{ fontSize: '0.65rem' }}>
                        💧 {f.rainChance}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/weather" className="btn btn-sm btn-outline-secondary w-100 mt-3">
              Full Agro-Met Advisory →
            </Link>
          </div>

          {/* Quick Direct Specialist Consultation */}
          <div className="card-custom p-3 bg-success-subtle border-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Stethoscope size={20} className="text-success" />
              <h6 className="fw-bold mb-0 text-success-emphasis">{t('expertConsultTitle')}</h6>
            </div>
            <p className="small text-secondary mb-3">
              Facing unexpected crop wilting, spots, or nutrient lock? Get verified solutions directly from certified extension scientists.
            </p>
            <Link to="/consultation" className="btn btn-sm btn-agri w-100">
              {t('requestConsult')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
