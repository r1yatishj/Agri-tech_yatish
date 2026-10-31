import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const SoilAnalysis = () => {
  const { t } = useLanguage();

  const [form, setForm] = useState({
    ph: 6.8,
    moisture: 45,
    nitrogen: 280,
    phosphorus: 22,
    potassium: 190,
    organicCarbon: 0.75,
    targetCrop: 'Wheat'
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/soil/analyze', form);
      setAnalysisResult(res.data.data);
    } catch (err) {
      console.error('Soil analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  // Radar Chart Data (Normalized to 0-100 scale)
  const radarData = {
    labels: ['pH Balance', 'Soil Moisture', 'Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Organic Carbon'],
    datasets: [
      {
        label: 'Current Soil Sample',
        data: [
          Math.min(100, Math.max(20, 100 - Math.abs(form.ph - 6.8) * 35)),
          Math.min(100, (form.moisture / 50) * 100),
          Math.min(100, (form.nitrogen / 350) * 100),
          Math.min(100, (form.phosphorus / 25) * 100),
          Math.min(100, (form.potassium / 220) * 100),
          Math.min(100, (form.organicCarbon / 0.8) * 100)
        ],
        backgroundColor: 'rgba(21, 128, 61, 0.25)',
        borderColor: '#15803d',
        borderWidth: 2,
        pointBackgroundColor: '#15803d'
      },
      {
        label: 'Scientific Target Benchmark',
        data: [100, 100, 100, 100, 100, 100],
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderColor: '#eab308',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointBackgroundColor: '#eab308'
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        angleLines: { color: '#e2e8f0' },
        grid: { color: '#e2e8f0' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } }
      }
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-success mb-1">{t('soilAnalysisTitle')}</h3>
        <p className="text-muted small mb-0">{t('soilSubtitle')}</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Interactive Telemetry Sliders */}
        <div className="col-lg-5">
          <div className="card-custom p-4 bg-white h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FlaskConical size={20} className="text-success" /> Soil Sensor & Lab Parameters
            </h5>

            {/* pH Slider */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">{t('phLevel')}</label>
                <span className={`badge ${form.ph >= 6.0 && form.ph <= 7.8 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                  {form.ph} (Ideal: 6.2 - 7.5)
                </span>
              </div>
              <input
                type="range"
                className="form-range"
                min="4.0"
                max="9.5"
                step="0.1"
                value={form.ph}
                onChange={(e) => setForm({ ...form, ph: parseFloat(e.target.value) })}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                <span>4.0 (Highly Acidic)</span>
                <span>7.0 (Neutral)</span>
                <span>9.5 (Alkaline)</span>
              </div>
            </div>

            {/* Moisture Slider */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">{t('moisturePercentage')}</label>
                <span className="badge bg-info-subtle text-info fw-bold">{form.moisture}%</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="10"
                max="90"
                step="1"
                value={form.moisture}
                onChange={(e) => setForm({ ...form, moisture: parseInt(e.target.value) })}
              />
            </div>

            {/* Nitrogen Input */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">{t('nitrogenKg')}</label>
                <span className="badge bg-secondary-subtle text-secondary fw-bold">{form.nitrogen} kg/ha</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="100"
                max="600"
                step="5"
                value={form.nitrogen}
                onChange={(e) => setForm({ ...form, nitrogen: parseInt(e.target.value) })}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                <span>&lt;250 (Deficient)</span>
                <span>280-450 (Optimal)</span>
                <span>&gt;500 (Excess)</span>
              </div>
            </div>

            {/* Phosphorus Input */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">{t('phosphorusKg')}</label>
                <span className="badge bg-secondary-subtle text-secondary fw-bold">{form.phosphorus} kg/ha</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="5"
                max="60"
                step="1"
                value={form.phosphorus}
                onChange={(e) => setForm({ ...form, phosphorus: parseInt(e.target.value) })}
              />
            </div>

            {/* Potassium Input */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">{t('potassiumKg')}</label>
                <span className="badge bg-secondary-subtle text-secondary fw-bold">{form.potassium} kg/ha</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="80"
                max="450"
                step="5"
                value={form.potassium}
                onChange={(e) => setForm({ ...form, potassium: parseInt(e.target.value) })}
              />
            </div>

            {/* Organic Carbon */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">{t('organicCarbonPct')}</label>
                <span className="badge bg-secondary-subtle text-secondary fw-bold">{form.organicCarbon}%</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="0.2"
                max="1.5"
                step="0.05"
                value={form.organicCarbon}
                onChange={(e) => setForm({ ...form, organicCarbon: parseFloat(e.target.value) })}
              />
            </div>

            <button
              className="btn btn-agri w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={runAnalysis}
              disabled={loading}
            >
              <Sparkles size={18} /> {loading ? 'Computing Analysis...' : t('calculateScore')}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Charts & Scientific Diagnostic Output */}
        <div className="col-lg-7">
          {analysisResult && (
            <div>
              {/* Score Header Card */}
              <div className="card-custom p-4 mb-4 bg-white">
                <div className="row align-items-center">
                  <div className="col-md-7">
                    <span className="badge bg-success-subtle text-success mb-1">Composite Agricultural Score</span>
                    <h4 className="fw-bold mb-1">{t('diagnosticResults')}</h4>
                    <p className="text-muted small mb-0">Evaluated against ICAR soil fertility index specifications.</p>
                  </div>
                  <div className="col-md-5 text-md-end mt-3 mt-md-0">
                    <div className="d-inline-block text-center p-3 rounded-4 bg-light border">
                      <div className="display-6 fw-bold text-success mb-0">{analysisResult.score} <span className="fs-6 text-muted">/100</span></div>
                      <span className="badge bg-success text-white px-2 py-1">{analysisResult.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Radar Chart Display */}
                <div className="mt-4 pt-3 border-top" style={{ maxHeight: '320px' }}>
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>

              {/* Actionable Nutrient Prescriptions */}
              <div className="card-custom p-4 mb-4 bg-white">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <TrendingUp size={20} className="text-success" /> {t('prescriptions')}
                </h5>
                <div className="row g-3">
                  {analysisResult.recommendations?.map((rec, idx) => (
                    <div key={idx} className="col-12">
                      <div className="p-3 rounded-3 bg-light border">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark">{rec.nutrient}</strong>
                          <span className={`badge ${rec.status.includes('Optimal') || rec.status.includes('Adequate') ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                            {rec.status}
                          </span>
                        </div>
                        <p className="small text-secondary mb-0 mt-1">{rec.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soil Amendments & Suitable Crops */}
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card-custom p-3 bg-white h-100">
                    <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                      <ShieldCheck size={18} className="text-success" /> {t('soilAmendments')}
                    </h6>
                    <ul className="small text-muted ps-3 mb-0">
                      {analysisResult.amendments?.map((am, i) => (
                        <li key={i} className="mb-2">{am}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card-custom p-3 bg-white h-100">
                    <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                      <CheckCircle2 size={18} className="text-success" /> {t('recommendedCrops')}
                    </h6>
                    <div className="d-flex flex-wrap gap-1 mt-2">
                      {analysisResult.suggestedCrops?.map((crop, i) => (
                        <span key={i} className="badge bg-success-subtle text-success px-2 py-1 rounded-pill">
                          🌱 {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilAnalysis;
