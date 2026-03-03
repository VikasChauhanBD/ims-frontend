import React, { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext/AuthContext";
import { authAPI } from "../../../services/api";
import "./EmployeeProfile.css";
import AnimatedBackground from "../../animatedBackground/AnimatedBackground";
import ActivityLog from "../activityLog/ActivityLog";

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getCurrentUser();
      setEmployee(response.data);
    } catch (err) {
      setError(err.message || "Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <AnimatedBackground />
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-container">
        <AnimatedBackground />
        <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="user-profile-container">
        <AnimatedBackground />
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No profile information available
        </div>
      </div>
    );
  }

  // Generate avatar based on email
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`;

  return (
    <div className="user-profile-container">
      <AnimatedBackground />
      <div className="user-profile-header">
        <div className="user-header-background"></div>
        <div className="user-profile-info-card">
          <div className="user-avatar-section">
            <img
              src={employee.profile_picture || avatarUrl}
              alt={employee.first_name}
              className="user-avatar"
              onError={(e) => {
                e.target.src = avatarUrl;
              }}
            />
            <div className="user-status-indicator"></div>
          </div>
          <div className="user-info-section">
            <h1 className="user-employee-name">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="user-employee-id">{employee.employee_id || employee.id}</p>
            <div className="user-info-grid">
              <div className="user-info-item">
                <span className="user-info-label">Department</span>
                <span className="user-info-value">{employee.department || "N/A"}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Role</span>
                <span className="user-info-value" style={{ textTransform: "capitalize" }}>
                  {employee.role || "Employee"}
                </span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Email</span>
                <span className="user-info-value">{employee.email}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Phone</span>
                <span className="user-info-value">{employee.phone_number || "N/A"}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Status</span>
                <span className="user-info-value">
                  {employee.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Joined</span>
                <span className="user-info-value">
                  {formatDate(employee.date_joined)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="user-profile-body">
        <ActivityLog />
      </div>
    </div>
  );
};

export default EmployeeProfile;
