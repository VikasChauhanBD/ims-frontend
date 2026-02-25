import React, { useState } from "react";
import "./AdminProfile.css";
import AnimatedBackground from "../../animatedBackground/AnimatedBackground";

const AdminProfile = () => {
  const [employee] = useState({
    id: "EMP-2024-001",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@company.com",
    department: "Engineering",
    position: "Senior Software Engineer",
    joinDate: "2022-03-15",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-profile-container">
      <AnimatedBackground />
      <div className="admin-profile-header">
        <div className="admin-header-background"></div>
        <div className="admin-profile-info-card">
          <div className="admin-avatar-section">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="admin-avatar"
            />
            <div className="admin-status-indicator"></div>
          </div>
          <div className="admin-info-section">
            <h1 className="admin-employee-name">{employee.name}</h1>
            <p className="admin-employee-id">{employee.id}</p>
            <div className="admin-info-grid">
              <div className="admin-info-item">
                <span className="admin-info-label">Department</span>
                <span className="admin-info-value">{employee.department}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Position</span>
                <span className="admin-info-value">{employee.position}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Email</span>
                <span className="admin-info-value">{employee.email}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Phone</span>
                <span className="admin-info-value">{employee.phone}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Location</span>
                <span className="admin-info-value">{employee.location}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Join Date</span>
                <span className="admin-info-value">
                  {formatDate(employee.joinDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
