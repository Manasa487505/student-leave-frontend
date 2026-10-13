import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../data/mockData';
import '../styles/Login.css';

const LoginPage = () => {
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or username is required.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission with backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(identifier, password, role);
      setIsLoading(false);

      if (result.success) {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } else {
        setSubmitError(result.error);
      }
    } catch (err) {
      setIsLoading(false);
      setSubmitError(err.message || 'Unable to connect to authentication server.');
    }
  };

  // Quick fill demo credentials into the form
  const handleQuickFill = (targetRole) => {
    setRole(targetRole);
    setIdentifier(DEMO_USERS[targetRole].email);
    setPassword(DEMO_USERS[targetRole].password);
    setErrors({});
    setSubmitError('');
  };

  // One-click instant login connecting to POST /api/auth/login
  const handleInstantLogin = async (targetRole) => {
    setIsLoading(true);
    setSubmitError('');
    try {
      const result = await quickLogin(targetRole);
      setIsLoading(false);

      if (result.success) {
        navigate(targetRole === 'admin' ? '/admin' : '/student');
      } else {
        setSubmitError(result.error);
      }
    } catch (err) {
      setIsLoading(false);
      setSubmitError(err.message || 'Quick login request failed.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="login-portal-icon">🎓</div>
          <h2>Student Leave Portal</h2>
          <p>College Leave Request Management System</p>
        </div>

        {/* Form Body */}
        <div className="login-body">
          {/* Role Selector Tabs */}
          <div>
            <label className="role-selector-label">Select Your Role</label>
            <div className="role-switch-group">
              <button
                type="button"
                className={`role-tab-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => {
                  setRole('student');
                  setSubmitError('');
                }}
              >
                <span>👨‍🎓</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setRole('admin');
                  setSubmitError('');
                }}
              >
                <span>🛡️</span>
                <span>Admin / Faculty</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email or Username */}
            <div className="form-group">
              <label htmlFor="identifier">
                {role === 'student' ? 'Student Email or Username' : 'Admin Email or Username'}
              </label>
              <input
                id="identifier"
                type="text"
                className={`form-control ${errors.identifier ? 'error' : ''}`}
                placeholder={role === 'student' ? 'e.g. student@college.edu or aarav_student' : 'e.g. admin@college.edu or admin_hod'}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors(prev => ({ ...prev, identifier: '' }));
                }}
              />
              {errors.identifier && <span className="error-text">{errors.identifier}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Login Action Button */}
            <button
              type="submit"
              className="btn btn-primary btn-submit-login"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting to Backend...' : `Sign In as ${role === 'student' ? 'Student' : 'Admin'}`}
            </button>
          </form>

          {/* Demo Credentials Helper Section */}
          <div className="demo-accounts-card">
            <div className="demo-title">
              <span>💡</span>
              <span>Quick Demo Testing Tools</span>
            </div>

            <div className="demo-buttons-row">
              <button
                type="button"
                className="btn-demo-quickfill"
                onClick={() => handleQuickFill('student')}
                title="Fill Student Credentials"
              >
                Fill Student
              </button>
              <button
                type="button"
                className="btn-demo-quickfill"
                onClick={() => handleQuickFill('admin')}
                title="Fill Admin Credentials"
              >
                Fill Admin
              </button>
              <button
                type="button"
                className="btn-demo-quickfill"
                style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                onClick={() => handleInstantLogin(role)}
                title="Direct 1-Click Login via Spring Boot API"
                disabled={isLoading}
              >
                ⚡ 1-Click Login
              </button>
            </div>

            <div className="demo-credentials-list">
              <div><strong>Student:</strong> <code>student@college.edu</code> / <code>student123</code></div>
              <div><strong>Admin:</strong> <code>admin@college.edu</code> / <code>admin123</code></div>
            </div>

            <p className="demo-disclaimer">
              * Live connected to Spring Boot backend at <code>http://localhost:8080/api/auth/login</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
