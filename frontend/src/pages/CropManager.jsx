import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Wheat, Plus, Calendar, Activity, CheckCircle, AlertCircle, Edit3, Trash2, X, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const STAGES = [
  'Germination',
  'Vegetative',
  'Flowering',
  'Yield Formation',
  'Maturity',
  'Harvested',
];

const HEALTH_STATUSES = ['Healthy', 'Good', 'Attention Needed', 'Pest Risk', 'Critical'];

const CropManager = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const farmIdFilter = searchParams.get('farmId');

  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    farmId: farmIdFilter || '',
    cropName: '',
    variety: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
    healthStatus: 'Healthy',
    currentStage: 'Vegetative',
    stageProgressPercent: 35,
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [cropsRes, farmsRes] = await Promise.all([
        api.get(farmIdFilter ? `/crops?farmId=${farmIdFilter}` : '/crops'),
        api.get('/farms'),
      ]);
      setCrops(cropsRes.data.data || []);
      setFarms(farmsRes.data.data || []);
      if (!formData.farmId && farmsRes.data.data?.length > 0) {
        setFormData((prev) => ({ ...prev, farmId: farmsRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [farmIdFilter]);

  const openCreateModal = () => {
    setEditingCrop(null);
    setFormData({
      farmId: farmIdFilter || (farms[0]?._id || ''),
      cropName: '',
      variety: '',
      plantingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
      healthStatus: 'Healthy',
      currentStage: 'Vegetative',
      stageProgressPercent: 35,
      notes: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setFormData({
      farmId: crop.farmId?._id || crop.farmId,
      cropName: crop.cropName,
      variety: crop.variety || '',
      plantingDate: new Date(crop.plantingDate).toISOString().split('T')[0],
      expectedHarvestDate: new Date(crop.expectedHarvestDate).toISOString().split('T')[0],
      healthStatus: crop.healthStatus || 'Healthy',
      currentStage: crop.stages?.currentStage || 'Vegetative',
      stageProgressPercent: crop.stages?.stageProgressPercent || 35,
      notes: crop.notes || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        farmId: formData.farmId,
        cropName: formData.cropName,
        variety: formData.variety,
        plantingDate: formData.plantingDate,
        expectedHarvestDate: formData.expectedHarvestDate,
        healthStatus: formData.healthStatus,
        stages: {
          currentStage: formData.currentStage,
          stageProgressPercent: Number(formData.stageProgressPercent),
        },
        notes: formData.notes,
      };

      if (editingCrop) {
        await api.put(`/crops/${editingCrop._id}`, payload);
      } else {
        await api.post('/crops', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save crop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStageAdvance = async (crop, newStage, newPercent) => {
    try {
      await api.put(`/crops/${crop._id}`, {
        stages: { currentStage: newStage, stageProgressPercent: newPercent },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this crop tracking record?')) return;
    try {
      await api.delete(`/crops/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Crop Growth & Lifecycle Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track vegetative stages, anticipated harvest windows, and soil nutrient health
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={farms.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Crop</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading crop data...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto border border-slate-200 space-y-3">
          <p className="text-sm font-bold text-slate-800">Please register a farm first!</p>
          <p className="text-xs text-slate-500">Crops must be attached to a farm profile for soil NPK tracking.</p>
          <Link
            to="/farms"
            className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
          >
            Go to Farm Registry
          </Link>
        </div>
      ) : crops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-200 space-y-4">
          <Wheat className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Crops Tracked Yet</h3>
          <p className="text-xs text-slate-500">
            Start monitoring crop growth cycles (Germination, Flowering, Harvest) and link IoT soil sensors.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md"
          >
            Add First Crop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crops.map((crop) => (
            <div
              key={crop._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-200 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-xs">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{crop.cropName}</h3>
                    <p className="text-xs text-slate-500">
                      Variety: <span className="font-semibold text-slate-700">{crop.variety || 'Hybrid'}</span> • Farm: {crop.farmId?.name || 'Assigned Farm'}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                    crop.healthStatus === 'Healthy'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : crop.healthStatus === 'Good'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : crop.healthStatus === 'Attention Needed'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {crop.healthStatus}
                </span>
              </div>

              {/* Lifecycle Stage Timeline Visualizer */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Growth Stage: <span className="text-emerald-700">{crop.stages?.currentStage || 'Vegetative'}</span></span>
                  <span className="text-slate-500">{crop.stages?.stageProgressPercent || 35}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${crop.stages?.stageProgressPercent || 35}%` }}
                  ></div>
                </div>

                {/* Quick Stage Progression Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {STAGES.map((st, sIdx) => {
                    const pct = Math.min(100, (sIdx + 1) * 16);
                    const isCurrent = crop.stages?.currentStage === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleQuickStageAdvance(crop, st, pct)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                          isCurrent
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates & Soil Diagnostics Snapshot */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Planted Date</span>
                    <span className="font-bold text-slate-700">
                      {new Date(crop.plantingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Expected Harvest</span>
                    <span className="font-bold text-slate-700">
                      {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Soil Telemetry Snapshot */}
              {crop.soilHealth && (
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      Live Soil Telemetry
                    </span>
                    <Link
                      to={`/soil-analytics?cropId=${crop._id}`}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Full Analysis & Charts →
                    </Link>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                    <div className="bg-white p-1 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">N</span>
                      <span className="font-bold text-emerald-800">{crop.soilHealth.nitrogen}</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">P</span>
                      <span className="font-bold text-emerald-800">{crop.soilHealth.phosphorus}</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">K</span>
                      <span className="font-bold text-emerald-800">{crop.soilHealth.potassium}</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">Moisture</span>
                      <span className="font-bold text-emerald-800">{crop.soilHealth.moisture}%</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">pH</span>
                      <span className="font-bold text-emerald-800">{crop.soilHealth.ph}</span>
                    </div>
                  </div>

                  {crop.soilHealth.aiRecommendation && (
                    <p className="text-[11px] text-emerald-800 leading-snug line-clamp-2">
                      💡 {crop.soilHealth.aiRecommendation}
                    </p>
                  )}
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <Link
                  to={`/soil-analytics?cropId=${crop._id}`}
                  className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Update Soil Metrics</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(crop)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    title="Edit Crop"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(crop._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Crop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCrop ? 'Edit Crop Lifecycle Record' : 'Register New Crop'}
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

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Farm Land</label>
                <select
                  required
                  value={formData.farmId}
                  onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {farms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    placeholder="e.g. Basmati Rice"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Variety / Hybrid</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g. Pusa 1121"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    required
                    value={formData.plantingDate}
                    onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Growth Stage</label>
                  <select
                    value={formData.currentStage}
                    onChange={(e) => setFormData({ ...formData, currentStage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Health Status</label>
                  <select
                    value={formData.healthStatus}
                    onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {HEALTH_STATUSES.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stage Progress ({formData.stageProgressPercent}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.stageProgressPercent}
                  onChange={(e) => setFormData({ ...formData, stageProgressPercent: e.target.value })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agronomic Field Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Record bio-stimulant spray, tillering observation, or soil conditioner application..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                ></textarea>
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
                  {submitting ? 'Saving...' : editingCrop ? 'Save Changes' : 'Register Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropManager;
