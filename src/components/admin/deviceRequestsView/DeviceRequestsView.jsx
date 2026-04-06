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
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [confirmRequest, setConfirmRequest] = useState(null);

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
    setProcessingRequestId(requestId);
    setProcessingAction(action);

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

      setPopup({
        open: true,
        title: action === "approve" ? "Request Approved" : "Request Rejected",
        message:
          action === "approve"
            ? "Device is assigned to user. Please complete the undertaking process."
            : "The device request has been rejected.",
        type: action === "approve" ? "success" : "info",
      });
    } catch (err) {
      console.error("Failed to update device request", err);
      const serverMessage =
        err.response?.data?.message || err.response?.data?.detail ||
        err.message ||
        "Unable to update device request status.";
      setPopup({
        open: true,
        title: "Update Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
      setConfirmRequest(null);
    }
  };

  const handleApproveClick = (request) => {
    setConfirmRequest(request);
  };

  const handleConfirmApprove = () => {
    if (!confirmRequest) return;
    handleAction(confirmRequest.id, "approve");
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
          const isProcessing = processingRequestId === request.id;
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
                {request.status === "pending" ? (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => handleApproveClick(request)}
                      disabled={isProcessing}
                    >
                      {isProcessing && processingAction === "approve"
                        ? "Approving..."
                        : "Approve"}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleAction(request.id, "reject")}
                      disabled={isProcessing}
                    >
                      {isProcessing && processingAction === "reject"
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </>
                ) : request.status === "approved" ? (
                  <button
                    className="btn-info"
                    onClick={() =>
                      setPopup({
                        open: true,
                        title: "Undertaking Process",
                        message:
                          "The device is approved and assigned. Please complete the undertaking process by documenting the handover and confirming receipt.",
                        type: "info",
                      })
                    }
                  >
                    Complete Undertaking
                  </button>
                ) : (
                  <button className="btn-info" disabled>
                    No Actions
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {confirmRequest && (
        <PopupModal
          open={true}
          title="Confirm Approval"
          message="Approving this request will assign the device to the user. Please complete the undertaking process."
          type="info"
          actions={[
            {
              label: "Cancel",
              variant: "secondary",
              onClick: () => setConfirmRequest(null),
            },
            {
              label: "Confirm",
              onClick: handleConfirmApprove,
            },
          ]}
          onClose={() => setConfirmRequest(null)}
        />
      )}
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
