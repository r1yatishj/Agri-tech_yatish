import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
  Trees,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Droplets,
  Activity,
  CheckCircle,
  AlertCircle,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';

const FarmManagement = () => {
  const { t } = useLanguage();
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activeCropForActivity, setActiveCropForActivity] = useState(null);

  // Farm Form
  const [farmForm, setFarmForm] = useState({
    farmName: '',
    village: '',
    district: '',
    state: '',
    totalArea: 5,
    soilType: 'Alluvial',
    irrigationType: 'Drip Irrigation'
  });

  // Crop Form
  const [cropForm, setCropForm] = useState({
    cropName: '',
    variety: '',
    areaAllocated: 2,
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stage: 'Vegetative',
    healthStatus: 'Good',
    ph: 6.8,
    moisture: 50,
    nitrogen: 280,
    phosphorus: 20,
    potassium: 180
  });

  // Activity Form
  const [activityForm, setActivityForm] = useState({
    action: 'Fertigation & Watering',
    notes: '',
    waterAmount: '2000 Litres',
    fertilizerUsed: 'Urea (25kg)'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fRes, cRes] = await Promise.all([
        axios.get('/api/farms'),
        axios.get('/api/crops')
      ]);
      setFarms(fRes.data.data || []);
      setCrops(cRes.data.data || []);
      if (fRes.data.data?.length > 0 && !selectedFarm) {
        setSelectedFarm(fRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        farmName: farmForm.farmName,
        location: {
          village: farmForm.village,
          district: farmForm.district,
          state: farmForm.state
        },
        totalArea: {
          value: parseFloat(farmForm.totalArea),
          unit: 'Acres'
        },
        soilType: farmForm.soilType,
        irrigationType: farmForm.irrigationType
      };
      await axios.post('/api/farms', payload);
      setShowFarmModal(false);
      setFarmForm({
        farmName: '',
        village: '',
        district: '',
        state: '',
        totalArea: 5,
        soilType: 'Alluvial',
        irrigationType: 'Drip Irrigation'
      });
      loadData();
    } catch (err) {
      alert('Failed to create farm: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteFarm = async (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await axios.delete(`/api/farms/${id}`);
        if (selectedFarm === id) setSelectedFarm(null);
        loadData();
      } catch (err) {
        alert('Failed to delete farm: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      const payload = {
        farmId: selectedFarm,
        cropName: cropForm.cropName,
        variety: cropForm.variety || 'Hybrid Standard',
        areaAllocated: parseFloat(cropForm.areaAllocated),
        plantingDate: cropForm.plantingDate,
        expectedHarvestDate: cropForm.expectedHarvestDate,
        stage: cropForm.stage,
        healthStatus: cropForm.healthStatus,
        soilMetrics: {
          ph: parseFloat(cropForm.ph),
          moisture: parseFloat(cropForm.moisture),
          nitrogen: parseFloat(cropForm.nitrogen),
          phosphorus: parseFloat(cropForm.phosphorus),
          potassium: parseFloat(cropForm.potassium)
        }
      };
      await axios.post('/api/crops', payload);
      setShowCropModal(false);
      loadData();
    } catch (err) {
      alert('Failed to add crop: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activeCropForActivity) return;
    try {
      await axios.post(`/api/crops/${activeCropForActivity._id}/activity`, activityForm);
      setShowActivityModal(false);
      loadData();
    } catch (err) {
      alert('Failed to add activity log: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateCropStage = async (cropId, newStage) => {
    try {
      await axios.put(`/api/crops/${cropId}`, { stage: newStage });
      loadData();
    } catch (err) {
      alert('Failed to update stage: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateCropHealth = async (cropId, newHealth) => {
    try {
      await axios.put(`/api/crops/${cropId}`, { healthStatus: newHealth });
      loadData();
    } catch (err) {
      alert('Failed to update health status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCrop = async (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await axios.delete(`/api/crops/${id}`);
        loadData();
      } catch (err) {
        alert('Failed to delete crop: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const currentFarmCrops = crops.filter((c) => (c.farmId?._id || c.farmId) === selectedFarm);
  const activeFarmObj = farms.find((f) => f._id === selectedFarm);

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-success mb-1">{t('farmManagement')}</h3>
          <p className="text-muted small mb-0">{t('farmSubtitle')}</p>
        </div>
        <button className="btn btn-agri d-flex align-items-center gap-2" onClick={() => setShowFarmModal(true)}>
          <Plus size={18} /> {t('addFarm')}
        </button>
      </div>

      {/* Farm Selection Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom">
        {farms.map((farm) => (
          <button
            key={farm._id}
            onClick={() => setSelectedFarm(farm._id)}
            className={`btn btn-sm ${
              selectedFarm === farm._id
                ? 'btn-success fw-bold text-white shadow-sm'
                : 'btn-outline-secondary bg-white'
            } d-flex align-items-center gap-2 px-3 py-2 rounded-3`}
          >
            <Trees size={16} />
            <span>{farm.farmName}</span>
            <span className="badge bg-white text-dark ms-1">{farm.totalArea?.value} {t('acres')}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading agricultural plots...</div>
      ) : farms.length === 0 ? (
        <div className="card-custom p-5 text-center">
          <Trees size={56} className="text-muted mb-3 opacity-50" />
          <h5 className="fw-bold">{t('noFarmsYet')}</h5>
          <p className="text-muted">Register your plot coordinates, soil type, and irrigation system to start managing crops.</p>
          <button className="btn btn-agri mt-2" onClick={() => setShowFarmModal(true)}>
            {t('addFarm')}
          </button>
        </div>
      ) : activeFarmObj && (
        <div>
          {/* Active Farm Detail Banner */}
          <div className="card-custom p-4 mb-4 bg-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom">
              <div>
                <span className="badge bg-success-subtle text-success mb-1">Active Farm Profile</span>
                <h4 className="fw-bold mb-1">{activeFarmObj.farmName}</h4>
                <p className="text-muted small mb-0">
                  📍 {activeFarmObj.location?.village ? `${activeFarmObj.location.village}, ` : ''}
                  {activeFarmObj.location?.district}, {activeFarmObj.location?.state}
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-agri d-flex align-items-center gap-1"
                  onClick={() => setShowCropModal(true)}
                >
                  <Plus size={16} /> {t('addCrop')}
                </button>
                <button
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  onClick={() => handleDeleteFarm(activeFarmObj._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Farm Specs Badges */}
            <div className="row g-3 mt-2">
              <div className="col-6 col-md-3">
                <div className="metric-box">
                  <span className="metric-label">{t('acres')}</span>
                  <div className="fs-5 fw-bold text-dark">{activeFarmObj.totalArea?.value} {activeFarmObj.totalArea?.unit}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="metric-box">
                  <span className="metric-label">{t('soilType')}</span>
                  <div className="fs-5 fw-bold text-dark">{activeFarmObj.soilType}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="metric-box">
                  <span className="metric-label">{t('irrigation')}</span>
                  <div className="fs-5 fw-bold text-dark">{activeFarmObj.irrigationType}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="metric-box">
                  <span className="metric-label">{t('cropsInFarm')}</span>
                  <div className="fs-5 fw-bold text-success">{currentFarmCrops.length} Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Crops in Selected Farm */}
          <h5 className="fw-bold mb-3">{t('cropsInFarm')} ({currentFarmCrops.length})</h5>

          {currentFarmCrops.length === 0 ? (
            <div className="card-custom p-4 text-center">
              <p className="text-muted mb-2">No active crops registered for this farm yet.</p>
              <button className="btn btn-sm btn-agri" onClick={() => setShowCropModal(true)}>
                {t('addCrop')}
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {currentFarmCrops.map((crop) => (
                <div key={crop._id} className="col-lg-6">
                  <div className="card-custom p-4 h-100 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold text-success mb-0">{crop.cropName}</h5>
                        <small className="text-muted">{crop.variety} • {crop.areaAllocated} {t('acres')}</small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger border-0 text-danger"
                        onClick={() => handleDeleteCrop(crop._id)}
                        title="Delete crop record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Stage & Health Selector */}
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small text-muted mb-1">{t('stage')}</label>
                        <select
                          className="form-select form-select-sm"
                          value={crop.stage}
                          onChange={(e) => handleUpdateCropStage(crop._id, e.target.value)}
                        >
                          <option value="Sowing">Sowing</option>
                          <option value="Vegetative">Vegetative</option>
                          <option value="Flowering">Flowering</option>
                          <option value="Maturity">Maturity</option>
                          <option value="Harvested">Harvested</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-muted mb-1">{t('healthStatus')}</label>
                        <select
                          className="form-select form-select-sm"
                          value={crop.healthStatus}
                          onChange={(e) => handleUpdateCropHealth(crop._id, e.target.value)}
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Needs Attention">Needs Attention</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="progress" style={{ height: '8px' }}>
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
                      <div className="d-flex justify-content-between small text-muted mt-1">
                        <span>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</span>
                        <span>Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Soil Telemetry Snapshot */}
                    <div className="p-3 bg-light rounded-3 mb-3">
                      <span className="small text-muted fw-bold d-block mb-2">Soil Sensor & Chemical Telemetry:</span>
                      <div className="row text-center small g-1">
                        <div className="col-4">
                          <span className="d-block text-muted">pH Level</span>
                          <span className="fw-bold">{crop.soilMetrics?.ph || '6.8'}</span>
                        </div>
                        <div className="col-4">
                          <span className="d-block text-muted">Moisture</span>
                          <span className="fw-bold">{crop.soilMetrics?.moisture || '45'}%</span>
                        </div>
                        <div className="col-4">
                          <span className="d-block text-muted">Nitrogen (N)</span>
                          <span className="fw-bold">{crop.soilMetrics?.nitrogen || '280'} kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Feed and Log Action */}
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <span className="small text-muted">
                        Activities logged: <strong>{crop.activities?.length || 0}</strong>
                      </span>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => {
                          setActiveCropForActivity(crop);
                          setShowActivityModal(true);
                        }}
                      >
                        + Log Field Activity
                      </button>
                    </div>

                    {/* Recent Activities */}
                    {crop.activities?.length > 0 && (
                      <div className="mt-2 pt-2 border-top small">
                        <span className="text-muted fw-bold" style={{ fontSize: '0.72rem' }}>LATEST LOG:</span>
                        <div className="text-secondary mt-1">
                          • {new Date(crop.activities[0].date).toLocaleDateString()} - <strong>{crop.activities[0].action}</strong> ({crop.activities[0].notes || 'Completed'})
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Create Farm */}
      {showFarmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{t('addFarm')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowFarmModal(false)}></button>
              </div>
              <form onSubmit={handleCreateFarm}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">{t('farmName')} *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ganga Valley Agro Plot"
                      required
                      value={farmForm.farmName}
                      onChange={(e) => setFarmForm({ ...farmForm, farmName: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-bold">Village</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Village"
                        value={farmForm.village}
                        onChange={(e) => setFarmForm({ ...farmForm, village: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-bold">District *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="District"
                        required
                        value={farmForm.district}
                        onChange={(e) => setFarmForm({ ...farmForm, district: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-bold">State *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="State"
                        required
                        value={farmForm.state}
                        onChange={(e) => setFarmForm({ ...farmForm, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-bold">{t('acres')} *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        required
                        value={farmForm.totalArea}
                        onChange={(e) => setFarmForm({ ...farmForm, totalArea: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-bold">{t('soilType')}</label>
                      <select
                        className="form-select"
                        value={farmForm.soilType}
                        onChange={(e) => setFarmForm({ ...farmForm, soilType: e.target.value })}
                      >
                        <option value="Alluvial">Alluvial</option>
                        <option value="Black Cotton">Black Cotton</option>
                        <option value="Red Soil">Red Soil</option>
                        <option value="Clay Loam">Clay Loam</option>
                        <option value="Sandy Loam">Sandy Loam</option>
                      </select>
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-bold">{t('irrigation')}</label>
                      <select
                        className="form-select"
                        value={farmForm.irrigationType}
                        onChange={(e) => setFarmForm({ ...farmForm, irrigationType: e.target.value })}
                      >
                        <option value="Drip Irrigation">Drip Irrigation</option>
                        <option value="Sprinkler">Sprinkler</option>
                        <option value="Tube Well / Borewell">Tube Well</option>
                        <option value="Canal / Flood">Canal / Flood</option>
                        <option value="Rainfed">Rainfed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowFarmModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-agri">Save Farm</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Crop */}
      {showCropModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{t('addCrop')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowCropModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCrop}>
                <div className="modal-body">
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Crop Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Wheat, Mustard, Cotton, Rice"
                        required
                        value={cropForm.cropName}
                        onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Variety / Seed Spec</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. HD-2967 High Yield"
                        value={cropForm.variety}
                        onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">{t('acres')} *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        required
                        value={cropForm.areaAllocated}
                        onChange={(e) => setCropForm({ ...cropForm, areaAllocated: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">{t('plantingDate')} *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={cropForm.plantingDate}
                        onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">{t('expectedHarvest')} *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={cropForm.expectedHarvestDate}
                        onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">{t('stage')}</label>
                      <select
                        className="form-select"
                        value={cropForm.stage}
                        onChange={(e) => setCropForm({ ...cropForm, stage: e.target.value })}
                      >
                        <option value="Sowing">Sowing</option>
                        <option value="Vegetative">Vegetative</option>
                        <option value="Flowering">Flowering</option>
                        <option value="Maturity">Maturity</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">{t('healthStatus')}</label>
                      <select
                        className="form-select"
                        value={cropForm.healthStatus}
                        onChange={(e) => setCropForm({ ...cropForm, healthStatus: e.target.value })}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Needs Attention">Needs Attention</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <h6 className="fw-bold mt-3 mb-2 small text-muted">Baseline Soil Parameters</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label small">pH Level</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm"
                        value={cropForm.ph}
                        onChange={(e) => setCropForm({ ...cropForm, ph: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Moisture (%)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={cropForm.moisture}
                        onChange={(e) => setCropForm({ ...cropForm, moisture: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Nitrogen (kg/ha)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={cropForm.nitrogen}
                        onChange={(e) => setCropForm({ ...cropForm, nitrogen: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowCropModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-agri">Register Crop</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Activity */}
      {showActivityModal && activeCropForActivity && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">Log Activity: {activeCropForActivity.cropName}</h5>
                <button type="button" className="btn-close" onClick={() => setShowActivityModal(false)}></button>
              </div>
              <form onSubmit={handleAddActivity}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Operation / Action *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Top Dressing Urea, Weeding, Drip Irrigation"
                      required
                      value={activityForm.action}
                      onChange={(e) => setActivityForm({ ...activityForm, action: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Water / Irrigation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 2 hours drip"
                        value={activityForm.waterAmount}
                        onChange={(e) => setActivityForm({ ...activityForm, waterAmount: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Fertilizer / Chemical</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Neem Cake 10kg"
                        value={activityForm.fertilizerUsed}
                        onChange={(e) => setActivityForm({ ...activityForm, fertilizerUsed: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Field Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Observations on soil moisture, crop vigor..."
                      value={activityForm.notes}
                      onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowActivityModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-agri">Save Log</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmManagement;
