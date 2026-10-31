import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import {
  Sprout,
  LayoutDashboard,
  Trees,
  FlaskConical,
  CloudSunRain,
  ShoppingBag,
  MessageSquareText,
  Stethoscope,
  ShieldAlert,
  LogOut,
  Globe,
  User,
  ShoppingCart
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleDemoLogin = async (role) => {
    try {
      if (role === 'farmer') {
        await login('farmer@agritech.com', 'password123');
      } else {
        await login('admin@agritech.com', 'admin123');
      }
      navigate('/dashboard');
    } catch (err) {
      alert('Demo login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/register');
  };

  return (
    <nav className="navbar navbar-expand-lg agri-navbar sticky-top py-2">
      <div className="container-fluid px-lg-4">
        {/* Brand */}
        <Link to="/" className="navbar-brand agri-brand d-flex align-items-center">
          <div className="bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
            <Sprout size={22} />
          </div>
          <div>
            <span className="fw-bold fs-5 text-success">{t('appName')}</span>
            <small className="d-block text-muted" style={{ fontSize: '0.68rem', fontWeight: 500, lineHeight: 1 }}>{t('tagline')}</small>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Items */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {isAuthenticated ? (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
              <li className="nav-item">
                <NavLink to="/dashboard" className="nav-link d-flex align-items-center gap-1">
                  <LayoutDashboard size={18} /> {t('navDashboard')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/farms" className="nav-link d-flex align-items-center gap-1">
                  <Trees size={18} /> {t('navFarms')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/soil" className="nav-link d-flex align-items-center gap-1">
                  <FlaskConical size={18} /> {t('navSoil')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/weather" className="nav-link d-flex align-items-center gap-1">
                  <CloudSunRain size={18} /> {t('navWeather')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/marketplace" className="nav-link d-flex align-items-center gap-1">
                  <ShoppingBag size={18} /> {t('navMarketplace')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/community" className="nav-link d-flex align-items-center gap-1">
                  <MessageSquareText size={18} /> {t('navForum')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/consultation" className="nav-link d-flex align-items-center gap-1">
                  <Stethoscope size={18} /> {t('navConsult')}
                </NavLink>
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <NavLink to="/admin" className="nav-link d-flex align-items-center gap-1 text-danger fw-semibold">
                    <ShieldAlert size={18} /> {t('navAdmin')}
                  </NavLink>
                </li>
              )}
            </ul>
          ) : (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              <li className="nav-item">
                <span className="text-muted small fst-italic">MERN Smart Agriculture Platform</span>
              </li>
            </ul>
          )}

          {/* Right utility buttons: Language, Cart, Profile */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {/* Language Switcher */}
            <div className="dropdown position-relative">
              <button
                className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
              >
                <Globe size={15} />
                <span className="fw-medium">{language === 'hi' ? 'हिन्दी' : 'English'}</span>
              </button>
              <ul className={`dropdown-menu dropdown-menu-end shadow-sm ${langOpen ? 'show d-block' : ''}`} style={{ right: 0 }}>
                <li>
                  <button className={`dropdown-item ${language === 'en' ? 'active bg-success' : ''}`} onClick={() => { setLanguage('en'); setLangOpen(false); }}>
                    🇬🇧 English
                  </button>
                </li>
                <li>
                  <button className={`dropdown-item ${language === 'hi' ? 'active bg-success' : ''}`} onClick={() => { setLanguage('hi'); setLangOpen(false); }}>
                    🇮🇳 हिन्दी (Hindi)
                  </button>
                </li>
              </ul>
            </div>

            {/* Cart Link */}
            {isAuthenticated && (
              <Link to="/marketplace?view=cart" className="btn btn-sm btn-outline-success position-relative d-flex align-items-center p-2">
                <ShoppingCart size={18} />
                {getCartCount() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile / Quick Login */}
            {isAuthenticated ? (
              <div className="dropdown position-relative">
                <button
                  className="btn btn-sm btn-light border dropdown-toggle d-flex align-items-center gap-2 py-1 px-2"
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                >
                  <img src={user.avatar || 'https://via.placeholder.com/32'} alt="User" className="rounded-circle" width="26" height="26" />
                  <span className="fw-semibold small d-none d-md-inline">{user.name.split(' ')[0]}</span>
                  <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-success'} text-white`} style={{ fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end shadow-sm ${profileOpen ? 'show d-block' : ''}`} style={{ right: 0 }}>
                  <li className="px-3 py-1">
                    <small className="text-muted d-block">{user.email}</small>
                    <small className="fw-bold text-dark">{user.location?.district ? `${user.location.district}, ${user.location.state}` : 'Kisan Member'}</small>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={() => { setProfileOpen(false); handleLogout(); }}>
                      <LogOut size={16} /> {t('logout')}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-sm btn-outline-success" onClick={() => handleDemoLogin('farmer')}>
                  🌱 {t('demoFarmer')}
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDemoLogin('admin')}>
                  🔬 {t('demoAdmin')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
