import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  Droplets,
  Thermometer,
  Zap,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  X,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SoilAnalytics = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCropId = searchParams.get('cropId');

  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [testForm, setTestForm] = useState({
    nitrogen: 150,
    phosphorus: 40,
    potassium: 210,
    moisture: 55,
    ph: 6.8,
    temperatureC: 25,
  });

  const fetchCrops = async () => {
    try {
      const res = await api.get('/crops');
      const list = res.data.data || [];
      setCrops(list);
      if (list.length > 0) {
        if (initialCropId && list.some((c) => c._id === initialCropId)) {
          setSelectedCropId(initialCropId);
        } else {
          setSelectedCropId(list[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const selectedCrop = crops.find((c) => c._id === selectedCropId) || crops[0];
  const soil = selectedCrop?.soilHealth || {
    nitrogen: 140,
    phosphorus: 35,
    potassium: 200,
    moisture: 45,
    ph: 6.8,
    temperatureC: 25,
    aiRecommendation: 'Soil nutrient levels are balanced. Maintain existing fertigation schedule.',
  };

  const handleOpenTestModal = () => {
    setTestForm({
      nitrogen: soil.nitrogen || 140,
      phosphorus: soil.phosphorus || 35,
      potassium: soil.potassium || 200,
      moisture: soil.moisture || 45,
      ph: soil.ph || 6.8,
      temperatureC: soil.temperatureC || 25,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const handleLogSoilTest = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await api.put(`/crops/${selectedCrop._id}/soil-health`, testForm);
      setSuccessMsg('Soil telemetry updated and AI recommendations generated!');
      setModalOpen(false);
      fetchCrops();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update soil health');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for status badge
  const getNPKStatus = (val, min, max) => {
    if (val < min) return { text: 'Low / Deficient', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (val > max) return { text: 'High / Excess', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    return { text: 'Optimal Range', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const nStatus = getNPKStatus(soil.nitrogen, 120, 180);
  const pStatus = getNPKStatus(soil.phosphorus, 25, 50);
  const kStatus = getNPKStatus(soil.potassium, 150, 250);

  // Simulated 6-week trend data for visualization
  const trendData = [
    { week: 'Week 1', moisture: 42, ph: 7.0, n: 130 },
    { week: 'Week 2', moisture: 48, ph: 6.9, n: 142 },
    { week: 'Week 3', moisture: 52, ph: 6.8, n: 148 },
    { week: 'Week 4', moisture: 46, ph: 6.7, n: 152 },
    { week: 'Week 5', moisture: 54, ph: 6.8, n: 150 },
    { week: 'Current', moisture: soil.moisture, ph: soil.ph, n: soil.nitrogen },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Soil Health Diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Crop Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Soil Health & NPK Precision Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Nitrogen, Phosphorus, Potassium, Moisture, and pH monitoring with AI agronomy advice
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {crops.length > 0 && (
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {crops.map((c) => (
                <option key={c._id} value={c._id}>
                  🌾 {c.cropName} ({c.farmId?.name || 'Farm'})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleOpenTestModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Soil Test</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary NPK Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nitrogen Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                N
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Nitrogen (N)</h3>
                <p className="text-[11px] text-slate-400">Chlorophyll & Leaf Growth</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${nStatus.color}`}>
              {nStatus.text}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{soil.nitrogen}</span>
              <span className="text-xs text-slate-500 font-semibold">mg/kg (ppm)</span>
            </div>
            <p className="text-[11px] text-slate-400">Target Benchmark: 120 - 180 mg/kg</p>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (soil.nitrogen / 220) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Phosphorus Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-sm">
                P
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Phosphorus (P)</h3>
                <p className="text-[11px] text-slate-400">Root & Seed Development</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${pStatus.color}`}>
              {pStatus.text}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{soil.phosphorus}</span>
              <span className="text-xs text-slate-500 font-semibold">mg/kg (ppm)</span>
            </div>
            <p className="text-[11px] text-slate-400">Target Benchmark: 25 - 50 mg/kg</p>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (soil.phosphorus / 60) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Potassium Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-sm">
                K
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Potassium (K)</h3>
                <p className="text-[11px] text-slate-400">Disease Resistance & Stems</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${kStatus.color}`}>
              {kStatus.text}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{soil.potassium}</span>
              <span className="text-xs text-slate-500 font-semibold">mg/kg (ppm)</span>
            </div>
            <p className="text-[11px] text-slate-400">Target Benchmark: 150 - 250 mg/kg</p>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (soil.potassium / 300) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Soil Moisture & pH Meter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Moisture Meter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Volumetric Soil Moisture</h3>
                <p className="text-[11px] text-slate-400">Root Zone Hydration Level</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                soil.moisture < 35
                  ? 'bg-amber-100 text-amber-800'
                  : soil.moisture > 70
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {soil.moisture < 35 ? 'Water Stress' : soil.moisture > 70 ? 'Waterlogged' : 'Prime Moisture'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">{soil.moisture}%</span>
            <span className="text-xs text-slate-500 font-semibold">Available Water Capacity</span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${soil.moisture}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>0% Wilting Point</span>
            <span>45-60% Field Capacity</span>
            <span>100% Saturated</span>
          </div>
        </div>

        {/* Soil pH Meter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Soil Acidity / Alkalinity (pH)</h3>
                <p className="text-[11px] text-slate-400">Cation Exchange & Nutrient Bioavailability</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                soil.ph < 6.0
                  ? 'bg-amber-100 text-amber-800'
                  : soil.ph > 7.5
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {soil.ph < 6.0 ? 'Acidic Soil' : soil.ph > 7.5 ? 'Alkaline Soil' : 'Neutral & Optimal'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">{soil.ph}</span>
            <span className="text-xs text-slate-500 font-semibold">Standard 0-14 Scale</span>
          </div>

          {/* Color spectrum gradient for pH */}
          <div className="relative pt-2">
            <div className="w-full h-3 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-purple-600"></div>
            <div
              className="absolute top-1 w-3.5 h-5 bg-slate-900 rounded-sm shadow-md border-2 border-white -translate-x-1/2"
              style={{ left: `${((soil.ph - 4) / (9 - 4)) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>4.0 Acidic (Lime needed)</span>
            <span>6.5 - 7.0 Neutral</span>
            <span>9.0 Alkaline (Gypsum needed)</span>
          </div>
        </div>
      </div>

      {/* AI Agronomic Recommendation Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-700/60 border border-emerald-500 text-emerald-300">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              AI Agronomy Diagnosis & Remediation Action Plan
            </h3>
            <p className="text-xs text-emerald-200">
              Generated based on active crop stage ({selectedCrop?.cropName || 'Crop'}) and NPK telemetry
            </p>
          </div>
        </div>

        <p className="text-sm text-emerald-100 leading-relaxed bg-white/10 p-4 rounded-2xl border border-white/10">
          {soil.aiRecommendation || 'Nutrient concentrations are within the safe threshold. Continue uniform irrigation.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-emerald-300 font-bold block mb-1">Fertigation Step:</span>
            <span>Maintain balanced N:P:K 4:2:1 ratio. Avoid excess nitrogen spray during flowering.</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-emerald-300 font-bold block mb-1">Irrigation Interval:</span>
            <span>Next watering cycle scheduled for early morning to reduce evapotranspiration losses.</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-emerald-300 font-bold block mb-1">Biological Treatment:</span>
            <span>Optional application of Trichoderma viride or mycorrhizae to enhance phosphorus uptake.</span>
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Multi-Week Soil Moisture & Nitrogen Trajectory
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">6-Week Historical Logs</span>
        </div>

        {/* Custom SVG Data Visualization Chart */}
        <div className="pt-4 pb-2">
          <div className="h-48 w-full flex items-end justify-between gap-3 px-2 border-b border-slate-200">
            {trendData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  {/* Nitrogen Bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all relative"
                    style={{ height: `${(d.n / 200) * 100}%` }}
                    title={`Nitrogen: ${d.n} mg/kg`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1 rounded transition-opacity">
                      {d.n}
                    </span>
                  </div>
                  {/* Moisture Bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-cyan-400 rounded-t-md hover:bg-cyan-500 transition-all relative"
                    style={{ height: `${d.moisture}%` }}
                    title={`Moisture: ${d.moisture}%`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1 rounded transition-opacity">
                      {d.moisture}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{d.week}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              <span>Soil Nitrogen (mg/kg)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-cyan-400"></span>
              <span>Moisture Level (%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Soil Test Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Log New Soil Test for {selectedCrop?.cropName}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleLogSoilTest} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nitrogen (N)</label>
                  <input
                    type="number"
                    required
                    value={testForm.nitrogen}
                    onChange={(e) => setTestForm({ ...testForm, nitrogen: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">mg/kg</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phosphorus (P)</label>
                  <input
                    type="number"
                    required
                    value={testForm.phosphorus}
                    onChange={(e) => setTestForm({ ...testForm, phosphorus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">mg/kg</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Potassium (K)</label>
                  <input
                    type="number"
                    required
                    value={testForm.potassium}
                    onChange={(e) => setTestForm({ ...testForm, potassium: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">mg/kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Soil Moisture (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={testForm.moisture}
                    onChange={(e) => setTestForm({ ...testForm, moisture: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Soil pH (0 - 14)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="11.0"
                    required
                    value={testForm.ph}
                    onChange={(e) => setTestForm({ ...testForm, ph: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Soil Temperature (°C)</label>
                <input
                  type="number"
                  value={testForm.temperatureC}
                  onChange={(e) => setTestForm({ ...testForm, temperatureC: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200"
                >
                  {submitting ? 'Analyzing & Saving...' : 'Save & Generate Advice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilAnalytics;
