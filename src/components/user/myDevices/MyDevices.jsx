import React, { useState } from "react";
import "./MyDevices.css";

const MyDevices = () => {
  const [devices] = useState([
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
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="md-content-section">
      <div className="md-section-header">
        <h2>Assigned Devices</h2>
        <span className="md-device-count">{devices.length} devices</span>
      </div>
      <div className="md-devices-grid">
        {devices.map((device) => (
          <div key={device.id} className="md-device-card">
            <div className="md-device-header">
              <span className="md-device-type">{device.type}</span>
              <span
                className={`md-device-status ${device.status.toLowerCase()}`}
              >
                {device.status}
              </span>
            </div>
            <h3 className="md-device-name">
              {device.brand} {device.model}
            </h3>
            <div className="md-device-details">
              <div className="md-detail-row">
                <span className="md-detail-label">Device ID</span>
                <span className="md-detail-value">{device.id}</span>
              </div>
              <div className="md-detail-row">
                <span className="md-detail-label">Serial Number</span>
                <span className="md-detail-value">{device.serialNumber}</span>
              </div>
              <div className="md-detail-row">
                <span className="md-detail-label">Assigned Date</span>
                <span className="md-detail-value">
                  {formatDate(device.assignedDate)}
                </span>
              </div>
              <div className="md-detail-row">
                <span className="md-detail-label">Condition</span>
                <span className="md-detail-value">{device.condition}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyDevices;
