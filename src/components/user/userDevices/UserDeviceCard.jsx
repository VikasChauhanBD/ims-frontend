import React, { useState } from "react";
import {
  Laptop,
  Smartphone,
  Calendar,
  Package,
  AlertCircle,
} from "lucide-react";
import "./UserDeviceCard.css";

export default function UserDeviceCard({
  device,
  onAssign,
  onEdit,
  assignedTo,
}) {
  const [showModal, setShowModal] = useState(false);
  const [ticketData, setTicketData] = useState({
    name: "",
    reason: "",
    priority: "Medium",
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

  const handleSubmitTicket = () => {
    console.log("Ticket Submitted: ", ticketData);
    alert("Your request has been submitted!");
    setShowModal(false);
    setTicketData({ name: "", reason: "", priority: "Medium" });
  };

  return (
    <>
      <div className="user-device-card">
        <div className="user-device-image">
          <img src={device.image} alt="" />
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
              <label>Your Name</label>
              <input
                type="text"
                value={ticketData.name}
                onChange={(e) =>
                  setTicketData({ ...ticketData, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Reason for Request</label>
              <textarea
                value={ticketData.reason}
                onChange={(e) =>
                  setTicketData({ ...ticketData, reason: e.target.value })
                }
              ></textarea>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={ticketData.priority}
                onChange={(e) =>
                  setTicketData({ ...ticketData, priority: e.target.value })
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
              <button className="btn-submit" onClick={handleSubmitTicket}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
