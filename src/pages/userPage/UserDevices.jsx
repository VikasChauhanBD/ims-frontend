import React, { useState, useEffect } from "react";
import { Search, Filter, Download, AlertCircle } from "lucide-react";
import { inventoryAPI } from "../../services/api";
import "./UserDevices.css";

const UserDevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("available");
  const [error, setError] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await inventoryAPI.getDevices();
      setDevices(response.data || []);
    } catch (err) {
      setError("Failed to load devices. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || device.device_type === filterType;
    const matchesStatus = filterStatus === "all" || device.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const deviceTypes = [
    "all",
    "laptop",
    "desktop",
    "pc",
    "monitor",
    "keyboard",
    "mouse",
    "headphone",
    "phone",
    "tablet",
  ];

  const handleRequestDevice = (device) => {
    setSelectedDevice(device);
    setShowRequestModal(true);
  };

  return (
    <div className="user-devices-page">
      <div className="devices-header">
        <div className="header-content">
          <h1>Available Devices</h1>
          <p className="subtitle">Browse and request devices for your work</p>
        </div>
        <button className="btn-export" title="Export devices list">
          <Download size={18} />
          Export
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="filters-section">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by brand, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="type-filter">Device Type</label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {deviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading devices...</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="empty-state">
          <svg
            className="empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2>No devices found</h2>
          <p>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="devices-grid">
          {filteredDevices.map((device) => (
            <div key={device.id} className="device-card">
              <div className="device-header">
                <div className="device-type-badge">
                  {device.device_type.toUpperCase()}
                </div>
                <div className={`status-badge status-${device.status}`}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </div>
              </div>

              <div className="device-body">
                <h3 className="device-name">{device.name}</h3>
                
                <div className="device-specs">
                  <div className="spec-row">
                    <span className="spec-label">Brand:</span>
                    <span className="spec-value">{device.brand}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Model:</span>
                    <span className="spec-value">{device.model}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Condition:</span>
                    <span className={`spec-value condition-${device.condition}`}>
                      {device.condition.charAt(0).toUpperCase() + device.condition.slice(1)}
                    </span>
                  </div>
                </div>

                {device.specifications && Object.keys(device.specifications).length > 0 && (
                  <details className="device-details">
                    <summary>View Details</summary>
                    <div className="details-content">
                      {Object.entries(device.specifications)
                        .filter(([key]) => key !== "id" && key !== "quantity")
                        .map(([key, value]) => (
                          <div key={key} className="detail-row">
                            <span className="detail-key">
                              {key.replace(/_/g, " ").toUpperCase()}:
                            </span>
                            <span className="detail-value">{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </details>
                )}
              </div>

              <div className="device-footer">
                <button
                  className={`btn-request ${
                    device.status !== "available" ? "disabled" : ""
                  }`}
                  onClick={() => handleRequestDevice(device)}
                  disabled={device.status !== "available"}
                >
                  {device.status === "available" ? "Request" : "Not Available"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Device</h2>
              <button
                className="close-btn"
                onClick={() => setShowRequestModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {selectedDevice && (
                <>
                  <div className="request-device-info">
                    <h3>{selectedDevice.name}</h3>
                    <p className="device-id">ID: {selectedDevice.device_id}</p>
                  </div>

                  <p className="request-message">
                    You are about to request this device. The administrator will
                    review your request and notify you of the approval status.
                  </p>

                  <textarea
                    placeholder="Any additional notes or reason for the request (optional)"
                    className="request-notes"
                    rows="4"
                  />
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDevicesPage;
