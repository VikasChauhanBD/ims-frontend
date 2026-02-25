import React, { useState } from "react";
import "./EmployeeProfile.css";
import AnimatedBackground from "../../animatedBackground/AnimatedBackground";
import MyDevices from "../myDevices/MyDevices";
import RequestHistory from "../requestHistory/RequestHistory";

const EmployeeProfile = () => {
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
    <div className="user-profile-container">
      <AnimatedBackground />
      <div className="user-profile-header">
        <div className="user-header-background"></div>
        <div className="user-profile-info-card">
          <div className="user-avatar-section">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="user-avatar"
            />
            <div className="user-status-indicator"></div>
          </div>
          <div className="user-info-section">
            <h1 className="user-employee-name">{employee.name}</h1>
            <p className="user-employee-id">{employee.id}</p>
            <div className="user-info-grid">
              <div className="user-info-item">
                <span className="user-info-label">Department</span>
                <span className="user-info-value">{employee.department}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Position</span>
                <span className="user-info-value">{employee.position}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Email</span>
                <span className="user-info-value">{employee.email}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Phone</span>
                <span className="user-info-value">{employee.phone}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Location</span>
                <span className="user-info-value">{employee.location}</span>
              </div>
              <div className="user-info-item">
                <span className="user-info-label">Join Date</span>
                <span className="user-info-value">
                  {formatDate(employee.joinDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="user-profile-body">
        <MyDevices />
        <RequestHistory />
      </div>
    </div>
  );
};

export default EmployeeProfile;
