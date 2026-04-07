import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Upload, AlertCircle } from "lucide-react";
import PopupModal from "../../common/PopupModal";
import { inventoryAPI } from "../../../services/api";
import "./DeviceRequestsView.css";

export default function DeviceRequestsView({
  requests = [],
  setRequests,
  devices = [],
  employees = [],
  onRefresh,
}) {
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [rejectReasonModal, setRejectReasonModal] = useState({ open: false, requestId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const toggleExpanded = (requestId) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

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

  const handleApproveConsent = async (requestId) => {
    setProcessingRequestId(requestId);
    setProcessingAction("approve_consent");

    try {
      await inventoryAPI.approveConsent(requestId);

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, consent_form_approved: true }
            : req,
        ),
      );

      if (onRefresh) onRefresh();

      setPopup({
        open: true,
        title: "Consent Approved",
        message: "The assignment consent has been approved. Notification sent to employee.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to approve consent", err);
      const serverMessage =
        err.response?.data?.message || err.response?.data?.detail ||
        err.message ||
        "Unable to approve consent";
      setPopup({
        open: true,
        title: "Approval Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleApproveReturn = async (requestId) => {
    setProcessingRequestId(requestId);
    setProcessingAction("approve_return");

    try {
      await inventoryAPI.approveReturn(requestId);

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, return_form_approved: true, status: "returned" }
            : req,
        ),
      );

      if (onRefresh) onRefresh();

      setPopup({
        open: true,
        title: "Return Approved",
        message: "The device return has been approved and processing is complete.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to approve return", err);
      const serverMessage =
        err.response?.data?.message || err.response?.data?.detail ||
        err.message ||
        "Unable to approve return";
      setPopup({
        open: true,
        title: "Approval Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleRejectClick = (requestId) => {
    setRejectReasonModal({ open: true, requestId });
  };

  const handleConfirmReject = async () => {
    const { requestId } = rejectReasonModal;
    if (!requestId) return;

    setProcessingRequestId(requestId);
    setProcessingAction("reject");

    try {
      await inventoryAPI.rejectDeviceRequest(requestId, rejectReason || "Rejected by admin");

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: "rejected" }
            : req,
        ),
      );

      if (onRefresh) onRefresh();

      setPopup({
        open: true,
        title: "Request Rejected",
        message: "The device request has been rejected.",
        type: "info",
      });
    } catch (err) {
      console.error("Failed to reject request", err);
      const serverMessage =
        err.response?.data?.message || err.response?.data?.detail ||
        err.message ||
        "Unable to reject request";
      setPopup({
        open: true,
        title: "Rejection Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
      setRejectReasonModal({ open: false, requestId: null });
      setRejectReason("");
    }
  };

  return (
    <div className="device-requests-container">
      <div className="device-requests-header">
        <h2 className="device-requests-title">Device Requests & Undertakings</h2>
        <p className="device-requests-subtitle">
          Review and approve device assignments and returns
        </p>
      </div>

      {requests.length === 0 && (
        <div className="no-requests-container">
          <AlertCircle className="no-requests-icon" />
          <p className="no-requests-text">No device requests available</p>
        </div>
      )}

      <div className="device-requests-list">
        {requests.map((request) => {
          const isExpanded = expandedRequestId === request.id;
          const isProcessing = processingRequestId === request.id;
          const statusClass = request.status || "pending";

          return (
            <div key={request.id} className="device-request-card">
              <div
                className="device-request-header"
                onClick={() => toggleExpanded(request.id)}
              >
                <div className="device-request-title-section">
                  <div className={`device-request-status-badge status-${statusClass}`}>
                    {statusClass.charAt(0).toUpperCase() + statusClass.slice(1).replace(/_/g, " ")}
                  </div>
                  <div className="device-request-info">
                    <h3 className="device-request-device-name">
                      {getDeviceSummary(request)}
                    </h3>
                    <p className="device-request-requester">
                      Requested by: {getRequesterName(request)}
                    </p>
                  </div>
                </div>
                <button className="device-request-toggle">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {isExpanded && (
                <div className="device-request-content">
                  {/* Request Details */}
                  <div className="device-request-section">
                    <h4 className="device-request-section-title">Request Details</h4>
                    <div className="device-request-details-grid">
                      <div className="device-request-detail-item">
                        <span className="device-request-label">Device Type</span>
                        <span className="device-request-value">{request.device_type}</span>
                      </div>
                      <div className="device-request-detail-item">
                        <span className="device-request-label">Reason</span>
                        <span className="device-request-value">{request.reason}</span>
                      </div>
                      <div className="device-request-detail-item">
                        <span className="device-request-label">Requested Date</span>
                        <span className="device-request-value">
                          {request.created_at ? new Date(request.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Consent Form Section - Only show if request is approved and consent exists */}
                  {request.assignment_details && request.assignment_details.consent_form_data && (
                    <div className="device-request-section">
                      <h4 className="device-request-section-title">Consent Form</h4>
                      <div className="device-request-consent-details">
                        <div className="device-request-consent-item">
                          <span className="device-request-label">Employee Name</span>
                          <span className="device-request-value">
                            {request.assignment_details.consent_form_data.employee_name}
                          </span>
                        </div>
                        <div className="device-request-consent-item">
                          <span className="device-request-label">Device</span>
                          <span className="device-request-value">
                            {request.assignment_details.consent_form_data.device_name}
                          </span>
                        </div>
                        <div className="device-request-consent-item">
                          <span className="device-request-label">Device Condition</span>
                          <span className="device-request-value">
                            {request.assignment_details.consent_form_data.condition}
                          </span>
                        </div>
                        <div className="device-request-consent-item">
                          <span className="device-request-label">Received Date</span>
                          <span className="device-request-value">
                            {request.assignment_details.consent_form_data.received_date}
                          </span>
                        </div>
                        <div className="device-request-consent-item">
                          <span className="device-request-label">Accessories</span>
                          <span className="device-request-value">
                            {request.assignment_details.consent_form_data.accessories || "None"}
                          </span>
                        </div>

                        {request.assignment_details.consent_form_data.signature_text && (
                          <div className="device-request-consent-item">
                            <span className="device-request-label">Signature</span>
                            <span className="device-request-value">
                              {request.assignment_details.consent_form_data.signature_text}
                            </span>
                          </div>
                        )}

                        {request.assignment_details.consent_form_data.uploaded_images &&
                          request.assignment_details.consent_form_data.uploaded_images.length > 0 && (
                            <div className="device-request-consent-images">
                              <span className="device-request-label">Uploaded Photos</span>
                              <div className="device-request-images-grid">
                                {request.assignment_details.consent_form_data.uploaded_images.map(
                                  (imageUrl, idx) => (
                                    <a
                                      key={idx}
                                      href={imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="device-request-image-thumbnail"
                                    >
                                      <img src={imageUrl} alt={`Photo ${idx + 1}`} />
                                    </a>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Return Form Section - Only show if return form is pending */}
                  {request.assignment_details && request.assignment_details.return_form_data && (
                    <div className="device-request-section">
                      <h4 className="device-request-section-title">Return Form</h4>
                      <div className="device-request-return-details">
                        <div className="device-request-return-item">
                          <span className="device-request-label">Return Date</span>
                          <span className="device-request-value">
                            {request.assignment_details.return_form_data.return_date}
                          </span>
                        </div>
                        <div className="device-request-return-item">
                          <span className="device-request-label">Device Condition at Return</span>
                          <span className="device-request-value">
                            {request.assignment_details.return_form_data.condition}
                          </span>
                        </div>
                        <div className="device-request-return-item">
                          <span className="device-request-label">Accessories Returned</span>
                          <span className="device-request-value">
                            {request.assignment_details.return_form_data.accessories || "None"}
                          </span>
                        </div>
                        {request.assignment_details.return_form_data.remarks && (
                          <div className="device-request-return-item">
                            <span className="device-request-label">Remarks</span>
                            <span className="device-request-value">
                              {request.assignment_details.return_form_data.remarks}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="device-request-actions">
                    {request.status === "pending" && (
                      <>
                        <button
                          className="btn-approve-consent"
                          onClick={() => handleApproveConsent(request.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "approve_consent"
                            ? "Approving..."
                            : "Approve Consent"}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectClick(request.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "reject"
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </>
                    )}

                    {request.status === "approved" &&
                      request.assignment_details &&
                      request.assignment_details.return_form_pending && (
                        <button
                          className="btn-approve-return"
                          onClick={() => handleApproveReturn(request.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "approve_return"
                            ? "Approving Return..."
                            : "Confirm Device Return"}
                        </button>
                      )}

                    {(request.status === "rejected" || request.status === "returned") && (
                      <button className="btn-completed" disabled>
                        {request.status === "rejected" ? "Rejected" : "Completed"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reject Reason Modal */}
      <PopupModal
        open={rejectReasonModal.open}
        title="Reject Device Request"
        message="Please provide a reason for rejecting this device request (optional)."
        type="warning"
        customContent={
          <textarea
            className="reject-reason-textarea"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows="4"
          />
        }
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => {
              setRejectReasonModal({ open: false, requestId: null });
              setRejectReason("");
            },
          },
          {
            label: "Confirm Rejection",
            onClick: handleConfirmReject,
          },
        ]}
        onClose={() => {
          setRejectReasonModal({ open: false, requestId: null });
          setRejectReason("");
        }}
      />

      {/* Status Popup */}
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
