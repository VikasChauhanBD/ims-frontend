import React, { useState } from "react";
import "../ticketRequestsView/TicketRequestsView.css";
import PopupModal from "../../common/PopupModal";
import { inventoryAPI } from "../../../services/api";

export default function DeviceRequestsView({
  requests,
  setRequests,
  devices,
  employees,
  onRefresh,
}) {
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });
  const getDeviceSummary = (request) => {
    if (!request) return "N/A";
    return `${request.brand || ""} ${request.model || ""}`.trim();
  };

  const getRequesterName = (request) => {
    if (request.requested_by_details) {
      return request.requested_by_details.full_name;
    }
    const employee = employees.find((e) => e.id === request.requested_by);
    return employee?.full_name || "Unknown User";
  };

  const handleAction = async (requestId, action) => {
    try {
      if (action === "approve") {
        await inventoryAPI.approveDeviceRequest(requestId);
      } else {
        await inventoryAPI.rejectDeviceRequest(requestId, "Rejected by admin");
      }
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: action === "approve" ? "approved" : "rejected",
              }
            : req,
        ),
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update device request", err);
      setPopup({
        open: true,
        title: "Update Failed",
        message: "Unable to update device request status.",
        type: "error",
      });
    }
  };

  return (
    <div className="ticket-requests-container">
      <h2 className="ticket-heading">Device Requests</h2>

      {requests.length === 0 && (
        <p className="no-request">No device requests available.</p>
      )}

      <div className="ticket-grid">
        {requests.map((request) => {
          const statusClass = request.status === "approved" ? "approved" : request.status;
          const displayStatus = statusClass.replace(/_/g, " ");
          return (
            <div key={request.id} className="ticket-card">
              <h3 className="ticket-title">
                {request.id} - {getDeviceSummary(request)}
              </h3>

              <p>
                <strong>User:</strong> {getRequesterName(request)}
              </p>

              <p>
                <strong>Device Type:</strong> {request.device_type}
              </p>

              <p>
                <strong>Reason:</strong> {request.reason}
              </p>

              <p className={`ticket-status status-${statusClass}`}>
                Status: {displayStatus}
              </p>

              <div className="ticket-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleAction(request.id, "approve")}
                  disabled={request.status !== "pending"}
                >
                  Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleAction(request.id, "reject")}
                  disabled={request.status !== "pending"}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <PopupModal
        open={popup.open}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
