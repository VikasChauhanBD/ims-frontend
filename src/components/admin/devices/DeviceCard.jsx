import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Package, AlertCircle } from "lucide-react";
import { uploadImage, validateImageFile } from "../../../services/imageUpload";
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
  const [editImageFile, setEditImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setEditDevice({ ...device });
  }, [device]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not set";
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime())
      ? "Not set"
      : date.toLocaleDateString();
  };

  const handleSaveEdit = async () => {
    setUploadingImage(true);
    try {
      let deviceData = { ...editDevice };
      
      // Handle image upload if a new image was selected
      if (editImageFile) {
        const validation = validateImageFile(editImageFile);
        if (!validation.valid) {
          alert(`Invalid image: ${validation.error}`);
          setUploadingImage(false);
          return;
        }
        
        const imageUrl = await uploadImage(editImageFile, {
          allowBase64Fallback: false,
        });
        deviceData.image_url = imageUrl;
      }
      
      if (onEdit) {
        await onEdit(deviceData);
      }
      setShowEditModal(false);
      setEditImageFile(null);
    } catch (err) {
      console.error("Error saving device:", err);
      alert("Failed to save device. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="device-card">
      <div className="device-image">
        <img
          src={
            device.image_url ||
            device.image ||
            "https://via.placeholder.com/320x180?text=No+Image"
          }
          alt={`${device.brand || "Device"} ${device.model || ""}`.trim()}
        />
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
            Purchased: {formatDate(device.purchase_date)}
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

      {/* Modal rendered via portal directly into document.body,
          bypassing the card's stacking context entirely */}
      {showEditModal &&
        createPortal(
          <div
            className="device-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEditModal(false);
            }}
          >
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
                    setEditDevice({
                      ...editDevice,
                      device_type: e.target.value,
                    })
                  }
                >
                  <option value="phone">Phone</option>
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="pc">PC</option>
                  <option value="monitor">Monitor</option>
                  <option value="keyboard">Keyboard</option>
                  <option value="mouse">Mouse</option>
                  <option value="headset">Headset</option>
                  <option value="headphone">Headphone</option>
                  <option value="tablet">Tablet</option>
                  <option value="cable">Cable</option>
                  <option value="charger">Charger</option>
                  <option value="pendrive">Pendrive</option>
                  <option value="hard_drive">Hard Drive</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
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
                      setEditImageFile(file);
                      const previewURL = URL.createObjectURL(file);
                      setEditDevice({ ...editDevice, image_url: previewURL });
                    }
                  }}
                  disabled={uploadingImage}
                />

                {editDevice.image_url && (
                  <img
                    src={editDevice.image_url}
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
                  className="device-btn-cancel"
                  onClick={() => setShowEditModal(false)}
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button 
                  className="device-btn-submit" 
                  onClick={handleSaveEdit}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
