import React, { useState, useEffect } from "react";
import { inventoryAPI } from "../../../services/api";
import { useAuth } from "../../../AuthContext/AuthContext";
import { mockDevices, mockAssignments } from "../../../assets/data/mockData";
import "./MyDevices.css";

const MyDevices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await inventoryAPI.getMyAssignments();
      const assignments = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      let devs = assignments.map((a) => ({
        id: a.device?.id || a.device,
        device_id: a.device?.device_id || "",
        type: a.device?.device_type || "",
        brand: a.device?.brand || "",
        model: a.device?.model || a.device?.device_name || "",
        serialNumber: a.device?.serial_number || "",
        assignedDate: a.assigned_date,
        status: a.status,
        condition: a.device?.condition || "",
        image: a.device?.image || null,
      }));

      // fallback to mocks if API returned nothing
      if (devs.length === 0) {
        const uid = user?.id ? String(user.id) : null;
        const userAssigns = uid
          ? mockAssignments.filter((a) => String(a.employee_id) === uid)
          : [];
        if (userAssigns.length) {
          devs = userAssigns.map((a) => {
            const d = mockDevices.find((m) => m.id === a.device_id);
            return {
              id: d?.device_id || d?.id || a.device_id,
              device_id: d?.device_id || "",
              type: d?.device_type,
              brand: d?.brand,
              model: d?.model,
              serialNumber: d?.serial_number || "",
              assignedDate: a.assigned_date,
              status: a.status,
              condition: d?.condition || "",
              image: d?.image || null,
            };
          });
        } else {
          devs = mockDevices.map((d) => ({
            id: d.device_id || d.id,
            device_id: d.device_id || "",
            type: d.device_type,
            brand: d.brand,
            model: d.model,
            serialNumber: d.serial_number || "",
            assignedDate: null,
            status: "available",
            condition: d.condition || "",
            image: d.image || null,
          }));
        }
      }

      setDevices(devs);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError(err.message || "Error loading devices");
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
      <div className="md-content-section" style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        Loading devices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-content-section" style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
        Error: {error}
      </div>
    );
  }

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
              {device.image && (
                <img
                  src={device.image}
                  alt="device"
                  className="md-device-image"
                />
              )}
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
