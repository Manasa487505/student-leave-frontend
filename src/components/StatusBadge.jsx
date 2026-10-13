import React from 'react';
import '../styles/StatusBadge.css';

const StatusBadge = ({ status }) => {
  const normalized = (status || 'Pending').toLowerCase();

  return (
    <span className={`status-badge ${normalized}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
