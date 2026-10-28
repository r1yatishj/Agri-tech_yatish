import React from 'react';
import { Sprout, Phone, Heart, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Agri-Tech</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering farmers with smart microclimate forecasts, precision soil NPK tracking, peer agronomy community, and direct agri-marketplace access.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>MERN Stack Architecture Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/farms" className="hover:text-emerald-400 transition-colors">Farm Profile & Management</a></li>
              <li><a href="/crops" className="hover:text-emerald-400 transition-colors">Crop Growth Stages</a></li>
              <li><a href="/soil-analytics" className="hover:text-emerald-400 transition-colors">NPK & Soil Health Visualizer</a></li>
              <li><a href="/weather" className="hover:text-emerald-400 transition-colors">Weather & Pest Early Warning</a></li>
              <li><a href="/marketplace" className="hover:text-emerald-400 transition-colors">Kisan Inputs Marketplace</a></li>
            </ul>
          </div>

          {/* Tech & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Agronomy Assistance</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Kisan Toll-Free Helpline</p>
                  <p>1800-180-1551 (6 AM - 10 PM)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Expert Desk</p>
                  <p>support@agritech.com</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Agricultural Hub</p>
                  <p>Kota - Bundi Agrarian Corridor, Rajasthan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Credentials Box */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Live Demo Logins</h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-700">
                <p className="font-bold text-slate-200">🌾 Farmer Portal:</p>
                <p className="text-slate-400">farmer@agritech.com / Farmer@123</p>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-700">
                <p className="font-bold text-purple-300">🛡️ Admin & Agronomist:</p>
                <p className="text-slate-400">admin@agritech.com / Admin@123</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Agri-Tech Platform. Built for Indian & Global Farmers.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>using React, Node.js, Express & MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
