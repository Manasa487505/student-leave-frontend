import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../context/LeaveContext';
import { LEAVE_TYPES } from '../data/mockData';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const {
    leaveRequests,
    fetchStudentLeaves,
    addLeaveRequest,
    calculateTotalDays,
    loading,
    apiError
  } = useLeaves();

  // Load student's leave requests from backend when dashboard mounts
  useEffect(() => {
    if (currentUser?.email) {
      fetchStudentLeaves(currentUser.email);
    }
  }, [currentUser?.email, fetchStudentLeaves]);

  // Leave Form State
  const [formData, setFormData] = useState({
    leaveType: LEAVE_TYPES[0],
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [successToast, setSuccessToast] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Compute Statistics directly from student requests
  const totalCount = leaveRequests.length;
  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'Rejected').length;

  // Filtered requests based on active tab
  const filteredRequests = leaveRequests.filter(req => {
    if (statusFilter === 'All') return true;
    return req.status === statusFilter;
  });

  // Calculate days for the form preview
  const previewDays = (formData.startDate && formData.endDate && formData.startDate <= formData.endDate)
    ? calculateTotalDays(formData.startDate, formData.endDate)
    : 0;

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.startDate) {
      errors.startDate = 'Start date is required.';
    }
    if (!formData.endDate) {
      errors.endDate = 'End date is required.';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      errors.endDate = 'End date cannot precede the start date.';
    }
    if (!formData.reason.trim()) {
      errors.reason = 'Please explain the reason for your leave.';
    } else if (formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters long.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit via Spring Boot POST /api/leaves
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessToast('');
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await addLeaveRequest({
        studentName: currentUser?.name || 'Student User',
        studentEmail: currentUser?.email || 'student@college.edu',
        studentRoll: currentUser?.rollNumber || '',
        department: currentUser?.department || '',
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });

      setIsSubmitting(false);
      setSuccessToast(`Leave request #${created.id} submitted successfully! Your application is now recorded in MySQL as Pending.`);

      // Reset Form
      setFormData({
        leaveType: LEAVE_TYPES[0],
        startDate: '',
        endDate: '',
        reason: ''
      });
      setFormErrors({});

      setTimeout(() => setSuccessToast(''), 6000);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Failed to submit application. Ensure backend is running at http://localhost:8080.');
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="container">
        {/* Welcome Hero Banner */}
        <div className="student-hero">
          <div className="student-hero-info">
            <h2>Welcome, {currentUser?.name}!</h2>
            <p>Student Leave Application & Attendance Tracking Portal</p>
          </div>
          <div className="student-hero-meta">
            <div className="meta-pill">
              <span>🆔</span>
              <span>Roll: {currentUser?.rollNumber || 'N/A'}</span>
            </div>
            <div className="meta-pill">
              <span>🏛️</span>
              <span>{currentUser?.department || 'General'}</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div className="stat-info">
              <h4>Total Applied</h4>
              <div className="stat-number">{totalCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">⏳</div>
            <div className="stat-info">
              <h4>Pending Approval</h4>
              <div className="stat-number">{pendingCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h4>Approved Leaves</h4>
              <div className="stat-number">{approvedCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">❌</div>
            <div className="stat-info">
              <h4>Rejected Leaves</h4>
              <div className="stat-number">{rejectedCount}</div>
            </div>
          </div>
        </section>

        {/* Dashboard 2-Column Grid */}
        <div className="dashboard-grid">
          {/* Column 1: Apply for Leave Form */}
          <div className="card">
            <h3 className="section-title">
              <span>📝</span>
              <span>Apply for Leave</span>
            </h3>
            <p className="section-desc">Submit your official leave request to the Spring Boot backend.</p>

            {successToast && (
              <div className="alert alert-success">
                <span>✅</span>
                <span>{successToast}</span>
              </div>
            )}

            {submitError && (
              <div className="alert alert-error">
                <span>⚠️</span>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Leave Type */}
              <div className="form-group">
                <label htmlFor="leaveType">Leave Category</label>
                <select
                  id="leaveType"
                  className="form-control"
                  value={formData.leaveType}
                  onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                >
                  {LEAVE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Start & End Dates */}
              <div className="form-date-grid">
                <div className="form-group">
                  <label htmlFor="startDate">From (Start Date)</label>
                  <input
                    id="startDate"
                    type="date"
                    className={`form-control ${formErrors.startDate ? 'error' : ''}`}
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, startDate: e.target.value }));
                      if (formErrors.startDate) setFormErrors(prev => ({ ...prev, startDate: '' }));
                    }}
                  />
                  {formErrors.startDate && <span className="error-text">{formErrors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">To (End Date)</label>
                  <input
                    id="endDate"
                    type="date"
                    className={`form-control ${formErrors.endDate ? 'error' : ''}`}
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, endDate: e.target.value }));
                      if (formErrors.endDate) setFormErrors(prev => ({ ...prev, endDate: '' }));
                    }}
                  />
                  {formErrors.endDate && <span className="error-text">{formErrors.endDate}</span>}
                </div>
              </div>

              {/* Duration Preview */}
              {previewDays > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span className="duration-indicator">
                    Total Duration: {previewDays} day{previewDays > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Reason for Leave */}
              <div className="form-group">
                <label htmlFor="reason">Detailed Reason for Leave</label>
                <textarea
                  id="reason"
                  rows="4"
                  className={`form-control ${formErrors.reason ? 'error' : ''}`}
                  placeholder="Provide a valid explanation (medical reasons, family emergency, academic conference, etc.)"
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, reason: e.target.value }));
                    if (formErrors.reason) setFormErrors(prev => ({ ...prev, reason: '' }));
                  }}
                ></textarea>
                {formErrors.reason && <span className="error-text">{formErrors.reason}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting to Backend...' : 'Submit Leave Application'}
              </button>
            </form>
          </div>

          {/* Column 2: Leave History Table */}
          <div className="card">
            <div className="table-filter-bar">
              <div>
                <h3 className="section-title">
                  <span>📜</span>
                  <span>My Leave History</span>
                </h3>
                <p className="section-desc" style={{ marginBottom: 0 }}>
                  Live records loaded from MySQL database.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="filter-pills-group">
                {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                  <button
                    key={status}
                    type="button"
                    className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {loading && leaveRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⏳</div>
                <h4>Loading leave requests...</h4>
                <p>Connecting to Spring Boot backend at http://localhost:8080</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h4>No leave requests found</h4>
                <p>No applications match the "{statusFilter}" filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Category</th>
                      <th>Dates & Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.displayId || `#${req.id}`}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Applied: {req.appliedDate || req.submissionDate}
                          </div>
                        </td>
                        <td>{req.leaveType}</td>
                        <td>
                          <div>{req.startDate} to {req.endDate}</div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ({req.totalDays} day{req.totalDays > 1 ? 's' : ''})
                          </span>
                        </td>
                        <td>
                          <div className="leave-reason-text" title={req.reason}>
                            {req.reason}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td>
                          <div className="admin-note-text">
                            {req.adminRemarks || '—'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
