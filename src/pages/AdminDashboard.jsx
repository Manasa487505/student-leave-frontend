import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../context/LeaveContext';
import { LEAVE_TYPES } from '../data/mockData';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const {
    leaveRequests,
    fetchAllLeaves,
    updateLeaveStatus,
    loading,
    apiError
  } = useLeaves();

  // Load all leave applications from backend when dashboard mounts
  useEffect(() => {
    fetchAllLeaves();
  }, [fetchAllLeaves]);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [feedbackToast, setFeedbackToast] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Action Modal State (for customized approval/rejection remarks)
  const [activeModal, setActiveModal] = useState(null); // { request, targetStatus, remarks }

  // Compute Metrics from loaded records
  const totalCount = leaveRequests.length;
  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'Rejected').length;

  // Filter & Search Logic
  const filteredRequests = leaveRequests.filter(req => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (req.studentName && req.studentName.toLowerCase().includes(term)) ||
      (req.studentRoll && req.studentRoll.toLowerCase().includes(term)) ||
      (req.studentEmail && req.studentEmail.toLowerCase().includes(term)) ||
      (req.id && String(req.id).toLowerCase().includes(term)) ||
      (req.displayId && req.displayId.toLowerCase().includes(term)) ||
      (req.reason && req.reason.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesType = typeFilter === 'All' || req.leaveType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Open modal for decision
  const handleOpenActionModal = (request, targetStatus) => {
    setActiveModal({
      request,
      targetStatus,
      remarks: targetStatus === 'Approved' ? 'Approved by Department Head.' : 'Reason for rejection: '
    });
  };

  // Confirm decision from modal and update Spring Boot backend PUT /api/leaves/{id}/status
  const handleConfirmDecision = async () => {
    if (!activeModal) return;

    const { request, targetStatus, remarks } = activeModal;
    setIsUpdating(true);

    try {
      await updateLeaveStatus(request.id, targetStatus, remarks, 'ADMIN');
      setIsUpdating(false);
      setFeedbackToast(`Application #${request.id} for ${request.studentName} has been ${targetStatus.toLowerCase()} successfully.`);
      setActiveModal(null);
      setTimeout(() => setFeedbackToast(''), 4500);
    } catch (err) {
      setIsUpdating(false);
      setFeedbackToast(`Error: ${err.message}`);
      setTimeout(() => setFeedbackToast(''), 5000);
    }
  };

  // Refresh leaves from backend
  const handleRefresh = async () => {
    await fetchAllLeaves();
    setFeedbackToast('Refreshed latest leave applications from MySQL database.');
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="container">
        {/* Admin Banner */}
        <div className="admin-hero">
          <div className="admin-hero-info">
            <h2>Faculty & Admin Portal</h2>
            <p>Department of Computer Science & Engineering | Leave Review Board</p>
          </div>
          <div className="admin-hero-actions">
            <button
              onClick={handleRefresh}
              className="btn-reset-demo"
              title="Fetch fresh data from Spring Boot backend"
              disabled={loading}
            >
              🔄 {loading ? 'Fetching...' : 'Refresh Backend Data'}
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Global Feedback Toast */}
        {feedbackToast && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            <span>📢</span>
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Analytics Stat Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📁</div>
            <div className="stat-info">
              <h4>Total Requests</h4>
              <div className="stat-number">{totalCount}</div>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #d97706' }}>
            <div className="stat-icon amber">⏳</div>
            <div className="stat-info">
              <h4>Pending Review</h4>
              <div className="stat-number">{pendingCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h4>Approved</h4>
              <div className="stat-number">{approvedCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">❌</div>
            <div className="stat-info">
              <h4>Rejected</h4>
              <div className="stat-number">{rejectedCount}</div>
            </div>
          </div>
        </section>

        {/* Main Content Card */}
        <div className="card">
          {/* Controls: Search and Filters */}
          <div className="filter-controls-card">
            <div className="search-input-wrapper">
              <span className="search-icon-symbol">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by student name, roll no, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group-right">
              {/* Status Filter */}
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses ({totalCount})</option>
                <option value="Pending">Pending Only ({pendingCount})</option>
                <option value="Approved">Approved Only ({approvedCount})</option>
                <option value="Rejected">Rejected Only ({rejectedCount})</option>
              </select>

              {/* Leave Type Filter */}
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {LEAVE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Leave Requests Table */}
          {loading && leaveRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <h4>Loading applications...</h4>
              <p>Connecting to Spring Boot backend at http://localhost:8080</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h4>No matching applications found</h4>
              <p>Try modifying your search criteria or filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Leave Category</th>
                    <th>Dates & Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id}>
                      {/* Student details */}
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar-small">
                            {req.studentName ? req.studentName.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div>
                            <div className="student-meta-name">{req.studentName}</div>
                            <div className="student-meta-sub">Roll: {req.studentRoll || 'N/A'}</div>
                            <div className="student-meta-sub" style={{ color: '#94a3b8' }}>
                              Ref: {req.displayId || `#${req.id}`} | {req.studentEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Leave Category */}
                      <td>
                        <strong>{req.leaveType}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Applied: {req.appliedDate || req.submissionDate}
                        </div>
                      </td>

                      {/* Dates & Duration */}
                      <td>
                        <div>{req.startDate} to {req.endDate}</div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-blue)' }}>
                          {req.totalDays} day{req.totalDays > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Reason */}
                      <td>
                        <div style={{ maxWidth: '280px', fontSize: '0.88rem' }}>
                          {req.reason}
                        </div>
                        {req.adminRemarks && (
                          <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <strong>Remark:</strong> {req.adminRemarks}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Action buttons */}
                      <td style={{ textAlign: 'center' }}>
                        {req.status === 'Pending' ? (
                          <div className="action-buttons-group" style={{ justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleOpenActionModal(req, 'Approved')}
                              title="Approve this application in MySQL"
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleOpenActionModal(req, 'Rejected')}
                              title="Reject this application in MySQL"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                              onClick={() => handleOpenActionModal(req, req.status === 'Approved' ? 'Rejected' : 'Approved')}
                              title="Reconsider decision"
                            >
                              Change to {req.status === 'Approved' ? 'Reject' : 'Approve'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Decision Remarks Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => !isUpdating && setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {activeModal.targetStatus === 'Approved' ? '✅ Approve Leave Request' : '❌ Reject Leave Request'}
              </h3>
              <button
                type="button"
                onClick={() => !isUpdating && setActiveModal(null)}
                style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '14px', fontSize: '0.9rem' }}>
                Updating status for <strong>{activeModal.request.studentName}</strong> (Application #{activeModal.request.id}) to{' '}
                <strong style={{ color: activeModal.targetStatus === 'Approved' ? '#16a34a' : '#dc2626' }}>
                  {activeModal.targetStatus}
                </strong>.
              </p>

              <div className="form-group">
                <label htmlFor="modalRemarks">Admin Remarks / Instructions for Student:</label>
                <textarea
                  id="modalRemarks"
                  rows="3"
                  className="form-control"
                  value={activeModal.remarks}
                  onChange={(e) =>
                    setActiveModal(prev => ({ ...prev, remarks: e.target.value }))
                  }
                  placeholder="Enter feedback or instructions..."
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveModal(null)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${activeModal.targetStatus === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmDecision}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving to Database...' : `Confirm ${activeModal.targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
