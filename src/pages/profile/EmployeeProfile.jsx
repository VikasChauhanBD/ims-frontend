import React, { useState } from "react";
import "./EmployeeProfile.css";
import AnimatedBackground from "../../components/animatedBackground/AnimatedBackground";

const EmployeeProfile = () => {
  // Sample employee data - replace with actual data from your API
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

  const [activeTab, setActiveTab] = useState("devices");

  // Sample devices data
  const devices = [
    {
      id: "DEV-001",
      type: "Laptop",
      brand: "Apple",
      model: 'MacBook Pro 16"',
      serialNumber: "C02XG0FDH7JY",
      assignedDate: "2023-08-15",
      status: "Active",
      condition: "Excellent",
    },
    {
      id: "DEV-002",
      type: "Mobile",
      brand: "Apple",
      model: "iPhone 14 Pro",
      serialNumber: "F2GKJH9P0M1Q",
      assignedDate: "2023-09-20",
      status: "Active",
      condition: "Good",
    },
  ];

  // Sample tickets data
  const tickets = [
    {
      id: "TKT-2024-045",
      type: "Device Request",
      item: 'iPad Pro 12.9"',
      requestDate: "2024-02-10",
      status: "Approved",
      approvedBy: "John Doe",
      approvalDate: "2024-02-11",
      notes: "Approved for field work requirements",
    },
    {
      id: "TKT-2024-038",
      type: "Device Replacement",
      item: "MacBook Pro Charger",
      requestDate: "2024-02-05",
      status: "Pending",
      notes: "Original charger damaged",
    },
    {
      id: "TKT-2024-022",
      type: "Software License",
      item: "Adobe Creative Cloud",
      requestDate: "2024-01-20",
      status: "Declined",
      declinedBy: "Jane Smith",
      declineDate: "2024-01-22",
      notes: "License already assigned to department",
    },
    {
      id: "TKT-2023-156",
      type: "Device Request",
      item: "Wireless Mouse",
      requestDate: "2023-12-15",
      status: "Approved",
      approvedBy: "Mike Johnson",
      approvalDate: "2023-12-16",
      notes: "Standard accessory approval",
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "status-approved";
      case "pending":
        return "status-pending";
      case "declined":
        return "status-declined";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "✓";
      case "pending":
        return "○";
      case "declined":
        return "✕";
      default:
        return "";
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

  return (
    <div className="profile-container">
      <AnimatedBackground />
      <div className="profile-header">
        <div className="header-background"></div>
        <div className="profile-info-card">
          <div className="avatar-section">
            <img src={employee.avatar} alt={employee.name} className="avatar" />
            <div className="status-indicator"></div>
          </div>
          <div className="info-section">
            <h1 className="employee-name">{employee.name}</h1>
            <p className="employee-id">{employee.id}</p>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{employee.department}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Position</span>
                <span className="info-value">{employee.position}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{employee.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{employee.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">{employee.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Join Date</span>
                <span className="info-value">
                  {formatDate(employee.joinDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-body">
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === "devices" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <span className="tab-icon">💻</span>
            My Devices
          </button>
          <button
            className={`tab ${activeTab === "tickets" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("tickets")}
          >
            <span className="tab-icon">📋</span>
            Request History
          </button>
        </div>

        {activeTab === "devices" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Assigned Devices</h2>
              <span className="device-count">{devices.length} devices</span>
            </div>
            <div className="devices-grid">
              {devices.map((device) => (
                <div key={device.id} className="device-card">
                  <div className="device-header">
                    <span className="device-type">{device.type}</span>
                    <span
                      className={`device-status ${device.status.toLowerCase()}`}
                    >
                      {device.status}
                    </span>
                  </div>
                  <h3 className="device-name">
                    {device.brand} {device.model}
                  </h3>
                  <div className="device-details">
                    <div className="detail-row">
                      <span className="detail-label">Device ID</span>
                      <span className="detail-value">{device.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Serial Number</span>
                      <span className="detail-value">
                        {device.serialNumber}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Assigned Date</span>
                      <span className="detail-value">
                        {formatDate(device.assignedDate)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Condition</span>
                      <span className="detail-value">{device.condition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Request History</h2>
              <div className="filter-chips">
                <span className="filter-chip approved">
                  Approved (
                  {tickets.filter((t) => t.status === "Approved").length})
                </span>
                <span className="filter-chip pending">
                  Pending (
                  {tickets.filter((t) => t.status === "Pending").length})
                </span>
                <span className="filter-chip declined">
                  Declined (
                  {tickets.filter((t) => t.status === "Declined").length})
                </span>
              </div>
            </div>
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-main">
                    <div className="ticket-left">
                      <div
                        className={`status-badge ${getStatusColor(ticket.status)}`}
                      >
                        <span className="status-icon">
                          {getStatusIcon(ticket.status)}
                        </span>
                        <span className="status-text">{ticket.status}</span>
                      </div>
                      <div className="ticket-info">
                        <h3 className="ticket-id">{ticket.id}</h3>
                        <p className="ticket-type">{ticket.type}</p>
                        <p className="ticket-item">{ticket.item}</p>
                      </div>
                    </div>
                    <div className="ticket-right">
                      <div className="ticket-dates">
                        <div className="date-item">
                          <span className="date-label">Requested</span>
                          <span className="date-value">
                            {formatDate(ticket.requestDate)}
                          </span>
                        </div>
                        {ticket.status === "Approved" &&
                          ticket.approvalDate && (
                            <div className="date-item">
                              <span className="date-label">Approved</span>
                              <span className="date-value">
                                {formatDate(ticket.approvalDate)}
                              </span>
                            </div>
                          )}
                        {ticket.status === "Declined" && ticket.declineDate && (
                          <div className="date-item">
                            <span className="date-label">Declined</span>
                            <span className="date-value">
                              {formatDate(ticket.declineDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {ticket.notes && (
                    <div className="ticket-notes">
                      <span className="notes-label">Notes:</span>
                      <span className="notes-text">{ticket.notes}</span>
                      {ticket.approvedBy && (
                        <span className="reviewer">
                          {" "}
                          • Approved by {ticket.approvedBy}
                        </span>
                      )}
                      {ticket.declinedBy && (
                        <span className="reviewer">
                          {" "}
                          • Declined by {ticket.declinedBy}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
