import React, { useState } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  Stethoscope
} from 'lucide-react';
import './AdminLoginPage.css';

const AdminLoginPage = ({ navigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleQuickDemoFill = () => {
    setFormData({
      email: 'admin@healpoint.com',
      password: 'Admin@12345'
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both administrator email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First try dedicated /api/admin/login
      let response;
      try {
        response = await axios.post(`${API_BASE_URL}/admin/login`, formData);
      } catch (err1) {
        // Fallback to /api/users/login
        response = await axios.post(`${API_BASE_URL}/users/login`, formData);
      }

      const { user, token } = response.data;

      if (!user || user.role !== 'ADMIN') {
        setError('Access denied: This portal is strictly restricted to HealPoint Administrators.');
        setLoading(false);
        return;
      }

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('adminToken', token);
      }
      window.dispatchEvent(new Event('user-auth-change'));

      setSuccess('Administrator authentication verified. Redirecting to dashboard...');

      setTimeout(() => {
        if (navigate) {
          navigate('/admin/dashboard');
        } else {
          window.location.href = '/admin/dashboard';
        }
      }, 800);

    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.message || 'Authentication failed. Please verify your administrator credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <header className="admin-login-header">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Stethoscope size={20} />
          </div>
          <span className="admin-brand-name">HealPoint</span>
          <span className="admin-brand-badge">Admin Portal</span>
        </div>

        <a 
          href="/" 
          className="admin-back-link" 
          onClick={(e) => { e.preventDefault(); if (navigate) navigate('/'); else window.location.href = '/'; }}
        >
          <ArrowLeft size={16} />
          <span>Back to Main Site</span>
        </a>
      </header>

      <main className="admin-login-main">
        <div className="admin-login-card">
          <div className="admin-card-header">
            <div className="admin-shield-icon-wrap">
              <ShieldCheck size={28} />
            </div>
            <h1>Administrator Sign In</h1>
            <p>Access doctor approvals, patient management & platform telemetry.</p>
          </div>

          {error && (
            <div className="admin-status-banner error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="admin-status-banner success" role="alert">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            <div className="admin-form-group">
              <label htmlFor="admin-email">Admin Email Address</label>
              <div className="admin-input-wrapper">
                <Mail size={16} className="admin-input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  placeholder="admin@healpoint.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">Secure Password</label>
              <div className="admin-input-wrapper">
                <Lock size={16} className="admin-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="admin-quick-fill-btn"
              onClick={handleQuickDemoFill}
            >
              <KeyRound size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Fill Demo Admin Credentials (admin@healpoint.com)
            </button>
          </form>

          <div className="admin-security-notice">
            <Lock size={13} />
            <span>256-bit encrypted audit session • Authorized personnel only</span>
          </div>
        </div>
      </main>

      <footer className="admin-login-footer">
        <p>© 2026 HealPoint Clinical Health Systems. All rights reserved. Strict role-based access enforced.</p>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
