import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, User, Phone, MapPin } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    village: '',
    district: '',
    state: 'Punjab',
    role: 'farmer'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
        location: {
          village: form.village,
          district: form.district,
          state: form.state
        }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card-custom p-4 p-md-5 bg-white shadow-sm border-0">
            <div className="text-center mb-4">
              <div className="bg-success text-white p-3 rounded-circle d-inline-flex mb-2 shadow-sm">
                <Sprout size={32} />
              </div>
              <h4 className="fw-extrabold text-success mb-1">Join AgriTech Network</h4>
              <p className="text-muted small">Register to monitor your crops and access smart agricultural tools</p>
            </div>

            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Balwinder Singh"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Mobile Phone *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="+91 98123 45678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  placeholder="farmer@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Password *</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Village</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Village"
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">District</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="District"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">State</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Account Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="farmer">Farmer (Kisan Profile)</option>
                  <option value="admin">Agronomy Extension Specialist / Admin</option>
                </select>
              </div>

              <button type="submit" className="btn btn-agri w-100 py-2 fw-bold" disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Farmer Registration'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
