import React, { useState, useEffect } from 'react';
import { Trees, Plus, MapPin, Layers, Droplets, Trash2, Edit3, X, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SOIL_TYPES = ['Loamy', 'Clay', 'Sandy', 'Black Soil', 'Alluvial', 'Red Soil'];
const IRRIGATION_TYPES = ['Drip Irrigation', 'Sprinkler', 'Canal Irrigation', 'Tube Well', 'Rainfed'];

const FarmManager = () => {
  const { t } = useLanguage();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    sizeAcres: '',
    soilType: 'Loamy',
    irrigationType: 'Drip Irrigation',
    cropsGrown: '',
  });

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      setFarms(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const openCreateModal = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      location: '',
      sizeAcres: '',
      soilType: 'Loamy',
      irrigationType: 'Drip Irrigation',
      cropsGrown: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location,
      sizeAcres: farm.sizeAcres,
      soilType: farm.soilType,
      irrigationType: farm.irrigationType || 'Drip Irrigation',
      cropsGrown: Array.isArray(farm.cropsGrown) ? farm.cropsGrown.join(', ') : '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (editingFarm) {
        await api.put(`/farms/${editingFarm._id}`, formData);
      } else {
        await api.post('/farms', formData);
      }
      setModalOpen(false);
      fetchFarms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save farm profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm? Associated crop records will also be removed.')) {
      return;
    }
    try {
      await api.delete(`/farms/${id}`);
      fetchFarms();
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
            Farm Profile & Land Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your land holdings, soil composition benchmarks, and irrigation setup
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Farm</span>
        </button>
      </div>

      {/* Farms List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading farm profiles...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Trees className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Farms Registered Yet</h3>
          <p className="text-xs text-slate-500">
            Register your first agricultural land holding to start tracking soil NPK, moisture levels, and crop yields.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md"
          >
            Register Farm Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      🏞️
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{farm.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {farm.location}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {farm.sizeAcres} Acres
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block">Soil Type</span>
                    <span className="font-bold text-slate-700">{farm.soilType}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block">Irrigation</span>
                    <span className="font-bold text-slate-700">{farm.irrigationType}</span>
                  </div>
                </div>

                {/* Crops Grown Pills */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Primary Crops Cultivated
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {farm.cropsGrown && farm.cropsGrown.length > 0 ? (
                      farm.cropsGrown.map((crop, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200"
                        >
                          🌾 {crop}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">None specified</span>
                    )}
                  </div>
                </div>

                {/* Soil Health summary badge */}
                {farm.soilHealthSummary && (
                  <div className="p-2.5 rounded-xl bg-green-50/70 border border-green-200 text-xs flex items-center justify-between">
                    <span className="text-[11px] text-green-900 font-medium">Avg Soil pH: {farm.soilHealthSummary.averagePH || 6.8}</span>
                    <span className="font-bold text-green-800 text-[11px]">
                      Grade: {farm.soilHealthSummary.healthGrade || 'Good'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                <Link
                  to={`/crops?farmId=${farm._id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  <span>View Crops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(farm)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    title="Edit Farm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(farm._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Farm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingFarm ? 'Edit Farm Profile' : 'Register New Farm Land'}
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
                <label className="block font-bold text-slate-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Surya Green Valley"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Village / District</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Sultanpur, Kota, Rajasthan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Land Size (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.sizeAcres}
                    onChange={(e) => setFormData({ ...formData, sizeAcres: e.target.value })}
                    placeholder="e.g. 8.5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Soil Classification</label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {SOIL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Irrigation System</label>
                <select
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {IRRIGATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Crops Grown (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.cropsGrown}
                  onChange={(e) => setFormData({ ...formData, cropsGrown: e.target.value })}
                  placeholder="e.g. Basmati Rice, Mustard, Wheat"
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
                  {submitting ? 'Saving...' : editingFarm ? 'Save Changes' : 'Register Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmManager;
