import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  Bug,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Leaf,
  Clock
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';

const WeatherPestRadar = () => {
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/weather/forecast');
        setWeatherData(res.data.data);
      } catch (err) {
        console.error('Error fetching weather & pest alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const forecast = weatherData?.forecast || [];
  const pestAlert = weatherData?.pestAlert;

  const chartData = {
    labels: forecast.map(f => f.day),
    datasets: [
      {
        label: 'Max Temp (°C)',
        data: forecast.map(f => f.maxTemp),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderRadius: 6
      },
      {
        label: 'Min Temp (°C)',
        data: forecast.map(f => f.minTemp),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { suggestedMin: 15, suggestedMax: 40 }
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-success mb-1">{t('weatherRadarTitle')}</h3>
        <p className="text-muted small mb-0">{t('weatherRadarSubtitle')}</p>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Retrieving meteorological telemetry...</div>
      ) : (
        <div>
          {/* Live Micro-Climate Banner */}
          <div className="card-custom p-4 mb-4 bg-white">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-success-subtle text-success">
                    <MapPin size={14} className="me-1" />
                    {weatherData?.location?.district}, {weatherData?.location?.state}
                  </span>
                  <span className="badge bg-secondary-subtle text-secondary">Live Ground Station</span>
                </div>
                <div className="d-flex align-items-baseline gap-3 my-2">
                  <h1 className="display-4 fw-extrabold text-success mb-0">
                    {weatherData?.currentWeather?.temperature}°C
                  </h1>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">{weatherData?.currentWeather?.condition}</h5>
                    <small className="text-muted">UV Index: {weatherData?.currentWeather?.uvIndex || 6} (Moderate)</small>
                  </div>
                </div>
              </div>

              <div className="col-lg-5 mt-3 mt-lg-0">
                <div className="row g-2">
                  <div className="col-4">
                    <div className="metric-box bg-white">
                      <Droplets size={20} className="text-info mb-1" />
                      <span className="metric-label d-block">{t('humidity')}</span>
                      <strong className="fs-6">{weatherData?.currentWeather?.humidity}%</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="metric-box bg-white">
                      <Wind size={20} className="text-secondary mb-1" />
                      <span className="metric-label d-block">{t('windSpeed')}</span>
                      <strong className="fs-6">{weatherData?.currentWeather?.windSpeed} km/h</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="metric-box bg-white">
                      <CloudSun size={20} className="text-primary mb-1" />
                      <span className="metric-label d-block">{t('rainfallChance')}</span>
                      <strong className="fs-6">{weatherData?.currentWeather?.rainfallProbability}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Grid & Chart */}
          <div className="row g-4 mb-4">
            <div className="col-lg-7">
              <div className="card-custom p-4 bg-white h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Calendar size={20} className="text-success" /> {t('sevenDayForecast')}
                </h5>
                <div className="row g-2">
                  {forecast.map((f, i) => (
                    <div key={i} className="col-6 col-md-4 col-xl">
                      <div className="border rounded-3 p-2 text-center h-100 bg-light">
                        <span className="fw-bold d-block text-dark">{f.day}</span>
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{f.date}</small>
                        <div className="my-2">
                          <CloudSun size={24} className="text-warning" />
                        </div>
                        <div className="small fw-bold text-dark">{f.maxTemp}° / {f.minTemp}°</div>
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>{f.condition}</small>
                        {f.rainChance > 20 && (
                          <span className="badge bg-info-subtle text-info mt-1" style={{ fontSize: '0.65rem' }}>
                            💧 {f.rainChance}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-muted small mb-2">Weekly Temperature Trend (°C)</h6>
                  <div style={{ height: '200px' }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pest & Pathogen Radar Card */}
            <div className="col-lg-5">
              <div className="card-custom p-4 bg-white h-100 border-warning">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="badge bg-danger-subtle text-danger mb-1">
                      <Bug size={14} className="me-1" /> Pathogen Surveillance
                    </span>
                    <h5 className="fw-bold mb-0">{t('pestRiskAssessment')}</h5>
                  </div>
                  <span className={`badge ${pestAlert?.riskLevel === 'High' || pestAlert?.riskLevel === 'Severe' ? 'bg-danger text-white' : 'bg-warning text-dark'} px-2 py-1`}>
                    {pestAlert?.riskLevel} Risk
                  </span>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <h6 className="fw-bold text-danger mb-1">{pestAlert?.pestName}</h6>
                  {pestAlert?.scientificName && (
                    <small className="text-muted fst-italic d-block mb-2">{pestAlert.scientificName}</small>
                  )}
                  <div className="small mb-2">
                    <strong>{t('affectedCrops')}: </strong>
                    {pestAlert?.affectedCrops?.map((c, i) => (
                      <span key={i} className="badge bg-secondary-subtle text-dark me-1">🌱 {c}</span>
                    ))}
                  </div>
                  <p className="small text-secondary mb-0">
                    <strong>{t('symptomsObserved')}:</strong> {pestAlert?.symptoms}
                  </p>
                </div>

                {/* Treatment Prescriptions */}
                <h6 className="fw-bold small text-muted mb-2">CLINICAL AGRI-SOLUTIONS:</h6>

                <div className="p-3 rounded-3 bg-success-subtle border border-success-subtle mb-2">
                  <span className="fw-bold text-success d-flex align-items-center gap-1 small mb-1">
                    <Leaf size={16} /> {t('organicTreatment')}
                  </span>
                  <p className="small text-dark mb-0">{pestAlert?.recommendedTreatment?.organic}</p>
                </div>

                <div className="p-3 rounded-3 bg-primary-subtle border border-primary-subtle mb-3">
                  <span className="fw-bold text-primary d-flex align-items-center gap-1 small mb-1">
                    <ShieldCheck size={16} /> {t('chemicalTreatment')}
                  </span>
                  <p className="small text-dark mb-0">{pestAlert?.recommendedTreatment?.chemical}</p>
                </div>

                <div className="small text-muted border-top pt-2">
                  <Clock size={14} className="me-1 text-warning" />
                  <strong>Agronomist Timing Rule:</strong> Spray treatments only during low wind velocity in the early morning (before 9 AM) or late afternoon to avoid photo-degradation and protect beneficial pollinators.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPestRadar;
