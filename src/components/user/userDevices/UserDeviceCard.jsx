import React, { useState } from "react";
import {
  Laptop,
  Smartphone,
  Calendar,
  Package,
  AlertCircle,
} from "lucide-react";
import { inventoryAPI } from "../../../services/api";
import PopupModal from "../../common/PopupModal";
import "./UserDeviceCard.css";

export default function UserDeviceCard({
  device,
  onAssign,
  onEdit,
  assignedTo,
  onTicketCreated,
}) {
  const [showModal, setShowModal] = useState(false);
  const [requestData, setRequestData] = useState({
    reason: "",
    priority: "Medium",
  });
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

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

  const handleSubmitDeviceRequest = async () => {
    if (!requestData.reason.trim()) {
      setPopup({
        open: true,
        title: "Validation Failed",
        message: "Please provide a reason for the device request.",
        type: "error",
      });
      return;
    }

    try {
      const payload = {
        device_type: device.device_type,
        brand: device.brand,
        model: device.model,
        specifications: device.specifications || {},
        reason: requestData.reason,
      };
      await inventoryAPI.createDeviceRequest(payload);
      if (onTicketCreated) onTicketCreated();
      setPopup({
        open: true,
        title: "Request Submitted",
        message: "Your device request has been submitted successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Device request error", err);
      const serverMessage =
        err.response?.data?.message || err.response?.data?.detail ||
        err.message ||
        "Failed to submit device request. Please try again.";
      setPopup({
        open: true,
        title: "Request Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setShowModal(false);
      setRequestData({ reason: "", priority: "Medium" });
    }
  };

  return (
    <>
      <div className="user-device-card">
        <div className="user-device-image">
          <img src={device.image || device.image_url || "https://via.placeholder.com/320x180?text=No+Image"} alt="" />
        </div>

        <div className="user-device-card-header">
          <div className="user-device-info">
            <div>
              <h3 className="user-device-name">
                {device.brand} {device.model}
              </h3>
              <p className="user-device-serial">{device.serial_number}</p>
            </div>
          </div>
          <span className={`user-device-status ${statusColors[device.status]}`}>
            {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
          </span>
        </div>

        <div className="user-device-details">
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
                className={`condition-text ${
                  conditionColors[device.condition]
                }`}
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

        {device.notes && <p className="user-device-notes">{device.notes}</p>}

        <div className="user-device-actions">
          {/* Request Device or Already Assigned */}
          {device.status === "available" ? (
            <button
              className="user-btn-assign"
              onClick={() => setShowModal(true)}
            >
              Request Device
            </button>
          ) : (
            <button className="user-btn-disabled" disabled>
              Already Assigned
            </button>
          )}
        </div>
      </div>

      {/* Ticket Request Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Request Device</h2>

            <div className="form-group">
              <label>Reason for Request</label>
              <textarea
                value={requestData.reason}
                onChange={(e) =>
                  setRequestData({ ...requestData, reason: e.target.value })
                }
              ></textarea>
            </div>

            <div className="form-group">
              <label>Request Priority</label>
              <select
                value={requestData.priority}
                onChange={(e) =>
                  setRequestData({ ...requestData, priority: e.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn-submit" onClick={handleSubmitDeviceRequest}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <PopupModal
        open={popup.open}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
