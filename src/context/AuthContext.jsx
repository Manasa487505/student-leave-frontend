import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { DEMO_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('college_leave_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('college_leave_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('college_leave_user');
    }
  }, [currentUser]);

  /**
   * Authenticate via Spring Boot POST /api/auth/login
   * @param {string} identifier - Email or username
   * @param {string} password - User password
   * @param {string} selectedRole - 'student' or 'admin'
   */
  const login = async (identifier, password, selectedRole) => {
    setLoading(true);
    try {
      const result = await authApi.login(identifier, password, selectedRole);

      if (result && result.success && result.data) {
        const payload = result.data;
        const user = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          username: payload.username,
          role: (payload.role || selectedRole).toLowerCase(), // normalize to 'student' or 'admin'
          rollNumber: payload.rollNumber || '',
          department: payload.department || '',
          designation: payload.designation || '',
          token: payload.token || ''
        };

        setCurrentUser(user);
        setLoading(false);
        return { success: true, user };
      } else {
        setLoading(false);
        return {
          success: false,
          error: result?.message || 'Authentication failed. Please verify your credentials.'
        };
      }
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        error: err.message || 'Error connecting to authentication service.'
      };
    }
  };

  /**
   * One-click demo login helper that connects directly to POST /api/auth/login
   */
  const quickLogin = async (role) => {
    const demo = DEMO_USERS[role];
    if (!demo) {
      return { success: false, error: 'Role not recognized' };
    }
    return await login(demo.email, demo.password, role);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('college_leave_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
