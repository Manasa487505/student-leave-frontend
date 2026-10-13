/**
 * API Service for Student Leave Request Management System
 * Connects React frontend to Spring Boot backend running at http://localhost:8080
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Helper to handle fetch responses and extract JSON data or error messages
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred while communicating with the server.';
    if (data) {
      if (typeof data.message === 'string') {
        errorMsg = data.message;
      } else if (data.data && typeof data.data === 'object') {
        // Validation field errors map
        errorMsg = Object.values(data.data).join('; ');
      }
    } else {
      errorMsg = `Server returned status ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return data;
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================
export const authApi = {
  /**
   * Authenticate student or admin user
   * POST /api/auth/login
   */
  async login(identifier, password, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password,
          role: role
        })
      });

      return await handleResponse(response);
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('Unable to connect to the backend server at http://localhost:8080. Please ensure your Spring Boot application is running.');
      }
      throw err;
    }
  },

  /**
   * Fetch demo users reference
   * GET /api/auth/demo-users
   */
  async getDemoUsers() {
    const response = await fetch(`${API_BASE_URL}/auth/demo-users`);
    return await handleResponse(response);
  }
};

// ==========================================
// LEAVE MANAGEMENT APIs
// ==========================================
export const leaveApi = {
  /**
   * Submit a new leave request
   * POST /api/leaves
   */
  async submitLeave(leaveData) {
    try {
      const response = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: leaveData.studentName,
          studentEmail: leaveData.studentEmail,
          studentRoll: leaveData.studentRoll || '',
          department: leaveData.department || '',
          leaveType: leaveData.leaveType,
          startDate: leaveData.startDate,
          endDate: leaveData.endDate,
          reason: leaveData.reason
        })
      });

      return await handleResponse(response);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Connection failed: Spring Boot backend is not reachable at http://localhost:8080.');
      }
      throw err;
    }
  },

  /**
   * List requests for a specific student by email
   * GET /api/leaves/student/{email}
   */
  async getStudentLeaves(email) {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`${API_BASE_URL}/leaves/student/${encodedEmail}`);
      return await handleResponse(response);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Connection failed: Spring Boot backend is not reachable at http://localhost:8080.');
      }
      throw err;
    }
  },

  /**
   * List all leave requests for admin (with optional status filter)
   * GET /api/leaves?status={status}
   */
  async getAllLeaves(status = 'All') {
    try {
      const url = status && status !== 'All'
        ? `${API_BASE_URL}/leaves?status=${encodeURIComponent(status)}`
        : `${API_BASE_URL}/leaves`;

      const response = await fetch(url);
      return await handleResponse(response);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Connection failed: Spring Boot backend is not reachable at http://localhost:8080.');
      }
      throw err;
    }
  },

  /**
   * Get single leave request by ID
   * GET /api/leaves/{id}
   */
  async getLeaveById(id) {
    const response = await fetch(`${API_BASE_URL}/leaves/${id}`);
    return await handleResponse(response);
  },

  /**
   * Approve or reject a leave request with remarks
   * PUT /api/leaves/{id}/status
   */
  async updateStatus(id, status, remarks, userRole = 'ADMIN') {
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole.toUpperCase()
        },
        body: JSON.stringify({
          status: status.toUpperCase(),
          adminRemarks: remarks || ''
        })
      });

      return await handleResponse(response);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Connection failed: Spring Boot backend is not reachable at http://localhost:8080.');
      }
      throw err;
    }
  },

  /**
   * Retrieve leave statistics summary
   * GET /api/leaves/stats
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/stats`);
      return await handleResponse(response);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Connection failed: Spring Boot backend is not reachable at http://localhost:8080.');
      }
      throw err;
    }
  }
};
