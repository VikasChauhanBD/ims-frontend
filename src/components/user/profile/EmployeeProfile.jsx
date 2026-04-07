import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../AuthContext/AuthContext";
import { authAPI } from "../../../services/api";
import { uploadImage, validateImageFile } from "../../../services/imageUpload";
import { Upload, X } from "lucide-react";
import "./EmployeeProfile.css";
import AnimatedBackground from "../../animatedBackground/AnimatedBackground";
import ActivityLog from "../activityLog/ActivityLog";

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const imageUrl = await uploadImage(file);
      
      // Update profile on server
      const response = await authAPI.updateProfile({
        profile_picture_url: imageUrl,
      });
      
      setEmployee(response.data);
      setUploadSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      setUploadError(err.message || "Failed to upload image");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
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
              src={employee.profile_picture_url || avatarUrl}
              alt={employee.first_name}
              className="user-avatar"
              onError={(e) => {
                e.target.src = avatarUrl;
              }}
            />
            <div className="user-status-indicator"></div>
            
            {/* Photo Upload Button */}
            <button
              className="upload-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Click to upload a new photo"
            >
              <Upload size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
            
            {/* Upload Messages */}
            {uploadError && (
              <div className="upload-message error">
                <X size={14} />
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="upload-message success">
                ✓ Photo updated successfully
              </div>
            )}
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
