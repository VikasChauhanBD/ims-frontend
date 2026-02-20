import React, { useState } from "react";
import { Calendar, Package, AlertCircle } from "lucide-react";
import "./DeviceCard.css";

export default function DeviceCard({ device, onAssign, onEdit, assignedTo }) {
  const statusColors = {
    available: "status-available",
    assigned: "status-assigned",
    maintenance: "status-maintenance",
    retired: "status-retired",
  };

  const conditionColors = {
    excellent: "condition-excellent",
    good: "condition-good",
    fair: "condition-fair",
    poor: "condition-poor",
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editDevice, setEditDevice] = useState({ ...device });

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editDevice);
    }
    setShowEditModal(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setEditDevice({ ...editDevice, image: imageURL });
    }
  };

  return (
    <div className="device-card">
      <div className="device-image">
        <img src={device.image} alt="" />
      </div>

      <div className="device-card-header">
        <div className="device-info">
          <div>
            <h3 className="device-name">
              {device.brand} {device.model}
            </h3>
            <p className="device-serial">{device.serial_number}</p>
          </div>
        </div>
        <span className={`device-status ${statusColors[device.status]}`}>
          {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
        </span>
      </div>

      <div className="device-details">
        <div className="detail-item">
          <Calendar className="detail-icon" />
          <span>
            Purchased: {new Date(device.purchase_date).toLocaleDateString()}
          </span>
        </div>
        <div className="detail-item">
          <Package className="detail-icon" />
          <span>
            Condition:{" "}
            <span
              className={`condition-text ${conditionColors[device.condition]}`}
            >
              {device.condition}
            </span>
          </span>
        </div>
        {assignedTo && (
          <div className="detail-item">
            <AlertCircle className="detail-icon" />
            <span>
              Assigned to: <span className="assigned-to">{assignedTo}</span>
            </span>
          </div>
        )}
      </div>

      {device.notes && <p className="device-notes">{device.notes}</p>}

      <div className="device-actions">
        {device.status === "available" && onAssign && (
          <button
            className="device-btn-assign"
            onClick={() => onAssign(device)}
          >
            Assign
          </button>
        )}
        <button
          className="device-btn-edit"
          onClick={() => setShowEditModal(true)}
        >
          Edit
        </button>
      </div>

      {/* ---------------- Edit Modal ---------------- */}
      {showEditModal && (
        <div className="device-modal-overlay">
          <div className="device-modal-box">
            <div className="device-modal-header">
              <h2>Edit Device</h2>
              <span
                className="close-icon"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </span>
            </div>

            <div className="device-modal-body">
              <label>Device Type</label>
              <select
                value={editDevice.device_type}
                onChange={(e) =>
                  setEditDevice({ ...editDevice, device_type: e.target.value })
                }
              >
                <option value="phone">Phone</option>
                <option value="laptop">Laptop</option>
              </select>

              <label>Brand</label>
              <input
                type="text"
                value={editDevice.brand}
                onChange={(e) =>
                  setEditDevice({ ...editDevice, brand: e.target.value })
                }
              />

              <label>Model</label>
              <input
                type="text"
                value={editDevice.model}
                onChange={(e) =>
                  setEditDevice({ ...editDevice, model: e.target.value })
                }
              />

              <label>Serial Number</label>
              <input
                type="text"
                value={editDevice.serial_number}
                onChange={(e) =>
                  setEditDevice({
                    ...editDevice,
                    serial_number: e.target.value,
                  })
                }
              />

              <label>Purchase Date</label>
              <input
                type="date"
                value={editDevice.purchase_date}
                onChange={(e) =>
                  setEditDevice({
                    ...editDevice,
                    purchase_date: e.target.value,
                  })
                }
              />

              <label>Status</label>
              <select
                value={editDevice.status}
                onChange={(e) =>
                  setEditDevice({ ...editDevice, status: e.target.value })
                }
              >
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>

              <label>Condition</label>
              <select
                value={editDevice.condition}
                onChange={(e) =>
                  setEditDevice({ ...editDevice, condition: e.target.value })
                }
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>

              <label>Notes</label>
              <input
                type="text"
                value={editDevice.notes}
                onChange={(e) =>
                  setEditDevice({ ...editDevice, notes: e.target.value })
                }
              />

              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const imageURL = URL.createObjectURL(file);
                    setEditDevice({ ...editDevice, image: imageURL });
                  }
                }}
              />

              {editDevice.image && (
                <img
                  src={editDevice.image}
                  alt="Preview"
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    borderRadius: "8px",
                    maxHeight: "150px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <div className="device-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="btn-submit" onClick={handleSaveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
