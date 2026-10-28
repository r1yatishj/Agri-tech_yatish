import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  ShieldAlert,
  Sun,
  CloudRain,
  Cloud,
  Bug,
  CheckCircle,
  HelpCircle,
  Info,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const WeatherAndPests = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherAndAlerts = async () => {
      try {
        const [wRes, aRes] = await Promise.all([
          api.get('/weather'),
          api.get('/weather/alerts'),
        ]);
        setWeather(wRes.data.data);
        setAlerts(aRes.data.data || []);
      } catch (err) {
        console.error('Failed to load weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherAndAlerts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Microclimate Radar & Pest Alarms...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
          <Bug className="w-3.5 h-3.5" />
          <span>Microclimate Intelligence & Bio-Risk Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Microclimate Telemetry & Automated Pest Warning System
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Forecasting fungal spores, insect vector outbreaks, and evapotranspiration risks using weather triggers
        </p>
      </div>

      {/* Real-Time Microclimate Telemetry Grid */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-700/60 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Field Station Radar: {weather?.region || 'Kota Agrarian Belt'}
            </span>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                {weather?.temperatureC || 31}°C
              </span>
              <div>
                <p className="text-lg font-bold text-slate-200">{weather?.condition}</p>
                <p className="text-xs text-slate-400">Feels like {weather?.feelsLikeC || 34}°C</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs space-y-2 max-w-sm">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Pest Risk Status:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Elevated
              </span>
            </div>
            <p className="text-slate-400 leading-snug">
              {weather?.pestVulnerabilityStatus || 'High humidity and warm air favor fungal spore germination.'}
            </p>
          </div>
        </div>

        {/* 6 Microclimate Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
            <Droplets className="w-5 h-5 text-blue-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Relative Humidity</p>
            <p className="text-xl font-extrabold text-white">{weather?.humidityPercent || 78}%</p>
            <p className="text-[10px] text-amber-300">Saturated Canopy</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
            <Wind className="w-5 h-5 text-teal-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Wind Velocity</p>
            <p className="text-xl font-extrabold text-white">{weather?.windSpeedKmh || 14} km/h</p>
            <p className="text-[10px] text-teal-300">{weather?.windDirection || 'North-West'}</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
            <CloudRain className="w-5 h-5 text-cyan-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Rain Probability</p>
            <p className="text-xl font-extrabold text-white">{weather?.rainProbabilityPercent || 40}%</p>
            <p className="text-[10px] text-slate-300">Scattered</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
            <Sun className="w-5 h-5 text-amber-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">UV Index</p>
            <p className="text-xl font-extrabold text-white">{weather?.uvIndex || 7} / 12</p>
            <p className="text-[10px] text-amber-300">Moderate High</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
            <Droplets className="w-5 h-5 text-green-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Evapotranspiration</p>
            <p className="text-xl font-extrabold text-white">4.2 mm</p>
            <p className="text-[10px] text-green-300">Daily Water Loss</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center space-y-1">
            <Compass className="w-5 h-5 text-purple-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Barometer</p>
            <p className="text-xl font-extrabold text-white">1012</p>
            <p className="text-[10px] text-purple-300">hPa (Stable)</p>
          </div>
        </div>

        {/* Hourly Forecast Strip */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hourly Canopy Temperature & Precipitation Chance
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {weather?.hourlyForecast?.map((h, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs space-y-1"
              >
                <p className="text-[11px] text-slate-400 font-semibold">{h.time}</p>
                <p className="text-base font-extrabold text-white">{h.temp}°C</p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-300">
                  <CloudRain className="w-3 h-3" />
                  <span>{h.rain}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Day Agricultural Forecast Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>5-Day Micro-Agronomic Outlook</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {weather?.forecast?.map((f, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 text-center"
            >
              <span className="text-xs font-bold text-slate-500 uppercase">{f.day}</span>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
                {f.rainChance > 50 ? '🌧️' : f.rainChance > 25 ? '⛅' : '☀️'}
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900">{f.tempMax}° / {f.tempMin}°C</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.condition}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600">
                <CloudRain className="w-3.5 h-3.5" />
                <span>{f.rainChance}% Rain Chance</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Pest & Disease Warning Advisories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Active Pest Outbreak & Disease Warning Advisories</span>
            </h2>
            <p className="text-xs text-slate-500">
              Automated alarms triggered by temperature, wet foliage, and historical vectors
            </p>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-200">
            {alerts.length} Active Warning(s)
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No High-Risk Pest Alarms Detected</p>
            <p className="text-xs text-slate-500">Field conditions are normal. Maintain standard scouting routines.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="bg-white rounded-3xl p-6 border-l-6 border-l-amber-500 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {alert.identifiedThreat || 'Pest & Fungal Infestation Alert'}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {alert.pestRiskLevel} Risk
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Region: <span className="font-semibold text-slate-700">{alert.region}</span> • Broadcasted by Agronomy Board
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 self-start sm:self-auto">
                    Active Advisory
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="leading-relaxed">
                    <span className="font-bold">Environmental Trigger: </span>
                    {alert.advisoryMessage}
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-emerald-900">Recommended Action: </span>
                    {alert.recommendedAction}
                  </p>
                </div>

                {alert.affectedCrops && alert.affectedCrops.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-600">Affected Crop Portfolios:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {alert.affectedCrops.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]"
                        >
                          🌾 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherAndPests;
