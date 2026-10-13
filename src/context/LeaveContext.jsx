import React, { createContext, useContext, useState, useCallback } from 'react';
import { leaveApi } from '../services/api';

const LeaveContext = createContext(null);

export const LeaveProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  /**
   * Normalize backend leave request object for consistent UI rendering
   */
  const normalizeRequest = (req) => {
    if (!req) return null;
    const rawStatus = req.status ? String(req.status).toUpperCase() : 'PENDING';
    const capitalizedStatus =
      rawStatus === 'APPROVED' ? 'Approved' :
      rawStatus === 'REJECTED' ? 'Rejected' : 'Pending';

    return {
      ...req,
      displayId: req.id ? (typeof req.id === 'number' ? `LV-2026-${String(req.id).padStart(3, '0')}` : req.id) : '',
      appliedDate: req.submissionDate || req.appliedDate || '',
      status: capitalizedStatus,
      rawStatus: rawStatus
    };
  };

  /**
   * Calculate duration in days between two YYYY-MM-DD strings
   */
  const calculateTotalDays = (start, end) => {
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  /**
   * Fetch leaves submitted by a student using GET /api/leaves/student/{email}
   */
  const fetchStudentLeaves = useCallback(async (email) => {
    if (!email) return [];
    setLoading(true);
    setApiError(null);
    try {
      const response = await leaveApi.getStudentLeaves(email);
      const list = (response.data || []).map(normalizeRequest);
      setLeaveRequests(list);
      setLoading(false);
      return list;
    } catch (err) {
      setLoading(false);
      setApiError(err.message);
      return [];
    }
  }, []);

  /**
   * Fetch all leaves for admin using GET /api/leaves
   */
  const fetchAllLeaves = useCallback(async (statusFilter = 'All') => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await leaveApi.getAllLeaves(statusFilter);
      const list = (response.data || []).map(normalizeRequest);
      setLeaveRequests(list);
      setLoading(false);
      return list;
    } catch (err) {
      setLoading(false);
      setApiError(err.message);
      return [];
    }
  }, []);

  /**
   * Fetch overall stats using GET /api/leaves/stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await leaveApi.getStats();
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.warn('Could not fetch leave stats:', err.message);
    }
  }, []);

  /**
   * Submit a new student leave request using POST /api/leaves
   */
  const addLeaveRequest = async (leaveData) => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await leaveApi.submitLeave(leaveData);
      const created = normalizeRequest(response.data);

      if (created) {
        setLeaveRequests(prev => [created, ...prev]);
      }
      setLoading(false);
      return created;
    } catch (err) {
      setLoading(false);
      setApiError(err.message);
      throw err;
    }
  };

  /**
   * Approve or reject a request using PUT /api/leaves/{id}/status
   */
  const updateLeaveStatus = async (leaveId, status, remarks = '', userRole = 'ADMIN') => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await leaveApi.updateStatus(leaveId, status, remarks, userRole);
      const updated = normalizeRequest(response.data);

      setLeaveRequests(prev =>
        prev.map(item => (item.id === leaveId ? updated : item))
      );

      setLoading(false);
      return updated;
    } catch (err) {
      setLoading(false);
      setApiError(err.message);
      throw err;
    }
  };

  /**
   * Re-fetches current leaves depending on role
   */
  const refreshLeaves = async (user) => {
    if (!user) return;
    if (user.role?.toLowerCase() === 'admin') {
      await fetchAllLeaves();
    } else if (user.email) {
      await fetchStudentLeaves(user.email);
    }
  };

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        stats,
        loading,
        apiError,
        fetchStudentLeaves,
        fetchAllLeaves,
        fetchStats,
        addLeaveRequest,
        updateLeaveStatus,
        refreshLeaves,
        calculateTotalDays
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeaves = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeaves must be used within a LeaveProvider');
  }
  return context;
};
