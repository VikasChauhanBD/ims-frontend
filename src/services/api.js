// src/services/api.js
import axios from "axios";

// Base API URL - Change this to your backend URL
const API_URL =
  import.meta.env.VITE_API_URL || "https://ims-backend-e4fp.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Authentication APIs
export const authAPI = {
  // Signup
  signup: (data) => api.post("/auth/signup/", data),

  // Login
  login: (credentials) => api.post("/auth/login/", credentials),

  // Logout
  logout: (refreshToken) =>
    api.post("/auth/logout/", { refresh_token: refreshToken }),

  // Get current user
  getCurrentUser: () => api.get("/auth/me/"),

  // Update profile
  updateProfile: (data) => api.patch("/auth/me/", data),

  // Change password
  changePassword: (data) => api.post("/auth/password/change/", data),

  // Request password reset
  requestPasswordReset: (email) => api.post("/auth/password/reset/", { email }),

  // Confirm password reset
  confirmPasswordReset: (data) =>
    api.post("/auth/password/reset/confirm/", data),

  // Verify reset token
  verifyResetToken: (token) =>
    api.get(`/auth/password/reset/verify/?token=${token}`),
};

// Inventory APIs
export const inventoryAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/inventory/dashboard/stats/"),

  // Devices
  getDevices: (params) => api.get("/inventory/devices/", { params }),
  getDevice: (id) => api.get(`/inventory/devices/${id}/`),
  createDevice: (data) => api.post("/inventory/devices/", data),
  updateDevice: (id, data) => api.patch(`/inventory/devices/${id}/`, data),
  deleteDevice: (id) => api.delete(`/inventory/devices/${id}/`),
  getAvailableDevices: () => api.get("/inventory/devices/available/"),
  markMaintenance: (id) =>
    api.post(`/inventory/devices/${id}/mark_maintenance/`),
  markAvailable: (id) => api.post(`/inventory/devices/${id}/mark_available/`),

  // Assignments
  getAssignments: (params) => api.get("/inventory/assignments/", { params }),
  getAssignment: (id) => api.get(`/inventory/assignments/${id}/`),
  createAssignment: (data) => api.post("/inventory/assignments/", data),
  updateAssignment: (id, data) =>
    api.patch(`/inventory/assignments/${id}/`, data),
  deleteAssignment: (id) => api.delete(`/inventory/assignments/${id}/`),
  returnDevice: (id, notes) =>
    api.post(`/inventory/assignments/${id}/return_device/`, {
      return_notes: notes,
    }),
  getMyAssignments: () => api.get("/inventory/assignments/my_assignments/"),

  // Tickets
  getTickets: (params) => api.get("/inventory/tickets/", { params }),
  getTicket: (id) => api.get(`/inventory/tickets/${id}/`),
  createTicket: (data) => api.post("/inventory/tickets/", data),
  updateTicket: (id, data) => api.patch(`/inventory/tickets/${id}/`, data),
  deleteTicket: (id) => api.delete(`/inventory/tickets/${id}/`),
  assignTicket: (id, employeeId) =>
    api.post(`/inventory/tickets/${id}/assign/`, { assigned_to: employeeId }),
  resolveTicket: (id, notes) =>
    api.post(`/inventory/tickets/${id}/resolve/`, { resolution_notes: notes }),
  getMyTickets: () => api.get("/inventory/tickets/my_tickets/"),
};

// Employee APIs
export const employeeAPI = {
  getEmployees: (params) => api.get("/inventory/employees/", { params }),
  getEmployee: (id) => api.get(`/inventory/employees/${id}/`),
};

// Helper function to handle file uploads
export const uploadFile = async (endpoint, file, additionalData = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  Object.keys(additionalData).forEach((key) => {
    formData.append(key, additionalData[key]);
  });

  return api.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Helper function to handle errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    const { data, status } = error.response;

    if (status === 400 && data) {
      // Validation errors
      const errors = {};
      Object.keys(data).forEach((key) => {
        errors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
      });
      return errors;
    }

    if (status === 401) {
      return { message: "Unauthorized. Please login again." };
    }

    if (status === 403) {
      return { message: "You do not have permission to perform this action." };
    }

    if (status === 404) {
      return { message: "Resource not found." };
    }

    if (status === 500) {
      return { message: "Server error. Please try again later." };
    }

    return { message: data.detail || data.message || "An error occurred." };
  }

  if (error.request) {
    // Request made but no response
    return { message: "Network error. Please check your connection." };
  }

  // Something else happened
  return { message: error.message || "An unexpected error occurred." };
};

export default api;
