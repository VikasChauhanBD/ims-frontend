import React, { useState } from "react";
import { ChevronDown, ChevronUp, Upload, AlertCircle } from "lucide-react";
import PopupModal from "../../common/PopupModal";
import { inventoryAPI } from "../../../services/api";
import { uploadImage, validateImageFile } from "../../../services/imageUpload";
import "./DeviceRequestsView.css";

export default function DeviceRequestsView({
  requests = [],
  setRequests,
  employees = [],
  onRefresh,
  title = "Device Requests & Undertakings",
  subtitle = "Review and approve device assignments and returns",
}) {
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [uploadingImageByRequestId, setUploadingImageByRequestId] = useState(
    {},
  );
  const [draftCycleImagesByRequestId, setDraftCycleImagesByRequestId] =
    useState({});
  const [rejectReasonModal, setRejectReasonModal] = useState({
    open: false,
    requestId: null,
  });
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
    const assignmentDeviceName = request.assignment_details?.device_details?.name;
    if (assignmentDeviceName) return assignmentDeviceName;
    return `${request.brand || ""} ${request.model || ""}`.trim() || "Requested Device";
  };

  const getRequesterName = (request) => {
    if (request.requested_by_details) {
      return request.requested_by_details.full_name;
    }
    const employee = employees.find((e) => e.id === request.requested_by);
    return employee?.full_name || "Unknown User";
  };

  const getStoredCycleImages = (request) =>
    Array.isArray(request?.assignment_details?.cycle_images)
      ? request.assignment_details.cycle_images
      : [];

  const getCycleImages = (request) =>
    draftCycleImagesByRequestId[request.id] ?? getStoredCycleImages(request);

  const hasCycleImageChanges = (request) => {
    const stored = getStoredCycleImages(request);
    const current = getCycleImages(request);
    return JSON.stringify(stored) !== JSON.stringify(current);
  };

  const updateRequestInState = (requestId, nextRequestPatch) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              ...nextRequestPatch,
            }
          : req,
      ),
    );
  };

  const clearDraftCycleImages = (requestId) => {
    setDraftCycleImagesByRequestId((prev) => {
      const next = { ...prev };
      delete next[requestId];
      return next;
    });
  };

  const handleCycleImageUpload = async (request, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setPopup({
        open: true,
        title: "Invalid Image",
        message: validation.error,
        type: "error",
      });
      return;
    }

    setUploadingImageByRequestId((prev) => ({ ...prev, [request.id]: true }));

    try {
      const imageUrl = await uploadImage(file);
      const nextImages = [...getCycleImages(request), imageUrl];
      setDraftCycleImagesByRequestId((prev) => ({
        ...prev,
        [request.id]: nextImages,
      }));
      setPopup({
        open: true,
        title: "Image Added",
        message:
          "Latest device image uploaded. You can add more or continue the approval flow.",
        type: "success",
      });
    } catch (error) {
      setPopup({
        open: true,
        title: "Upload Failed",
        message: error.message || "Unable to upload device image.",
        type: "error",
      });
    } finally {
      setUploadingImageByRequestId((prev) => ({
        ...prev,
        [request.id]: false,
      }));
    }
  };

  const handleRemoveCycleImage = (request, indexToRemove) => {
    const nextImages = getCycleImages(request).filter(
      (_, index) => index !== indexToRemove,
    );
    setDraftCycleImagesByRequestId((prev) => ({
      ...prev,
      [request.id]: nextImages,
    }));
  };

  const handleSendForConsent = async (request) => {
    const cycleImages = getCycleImages(request);
    if (cycleImages.length === 0) {
      setPopup({
        open: true,
        title: "Images Required",
        message:
          "Upload at least one latest device image before asking the employee to fill the consent form.",
        type: "warning",
      });
      return;
    }

    setProcessingRequestId(request.id);
    setProcessingAction("send_for_consent");

    try {
      const response = await inventoryAPI.grantDeviceRequest(request.id, {
        cycle_images: cycleImages,
      });
      const updatedRequest = response.data?.request;

      updateRequestInState(request.id, {
        ...(updatedRequest || { status: "consent_pending" }),
      });
      clearDraftCycleImages(request.id);

      if (onRefresh) {
        await onRefresh();
      }

      setPopup({
        open: true,
        title: "Consent Requested",
        message:
          "The latest device images were attached and the employee was asked to fill the consent form.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to send request for consent", err);
      const serverMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unable to continue this request";
      setPopup({
        open: true,
        title: "Request Update Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleSaveCycleImages = async (request) => {
    const assignmentId = request.assignment_details?.id;
    const cycleImages = getCycleImages(request);

    if (!assignmentId) return;

    if (cycleImages.length === 0) {
      setPopup({
        open: true,
        title: "Images Required",
        message: "Please keep at least one image in the request cycle.",
        type: "warning",
      });
      return;
    }

    setProcessingRequestId(request.id);
    setProcessingAction("save_cycle_images");

    try {
      const response = await inventoryAPI.updateAssignmentCycleImages(
        assignmentId,
        { cycle_images: cycleImages },
      );
      const updatedAssignment = response.data?.assignment;

      updateRequestInState(request.id, {
        assignment_details: updatedAssignment || request.assignment_details,
      });
      clearDraftCycleImages(request.id);

      if (onRefresh) {
        await onRefresh();
      }

      setPopup({
        open: true,
        title: "Images Saved",
        message: "The latest device images were updated for this request cycle.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to save request cycle images", err);
      const serverMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unable to save request cycle images";
      setPopup({
        open: true,
        title: "Save Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleApproveConsent = async (assignmentId, requestId) => {
    setProcessingRequestId(requestId);
    setProcessingAction("approve_consent");

    try {
      const response = await inventoryAPI.approveConsent(assignmentId);
      const updatedAssignment = response.data?.assignment;

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "active",
                assignment_details: updatedAssignment || req.assignment_details,
              }
            : req,
        ),
      );

      if (onRefresh) {
        await onRefresh();
      }

      setPopup({
        open: true,
        title: "Device Granted",
        message:
          "The consent form was verified and the device has been granted to the employee.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to approve consent", err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unable to approve consent";
      setPopup({
        open: true,
        title: "Verification Failed",
        message: serverMessage,
        type: "error",
      });
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleApproveReturn = async (assignmentId, requestId) => {
    setProcessingRequestId(requestId);
    setProcessingAction("approve_return");

    try {
      const response = await inventoryAPI.approveReturn(assignmentId);
      const updatedAssignment = response.data?.assignment;

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                assignment_details: updatedAssignment || req.assignment_details,
                status: "returned",
              }
            : req,
        ),
      );

      if (onRefresh) {
        await onRefresh();
      }

      setPopup({
        open: true,
        title: "Return Approved",
        message: "The device return has been approved and the cycle is complete.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to approve return", err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
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
    setProcessingAction("revoke");

    try {
      await inventoryAPI.revokeDeviceRequest(
        requestId,
        rejectReason || "Revoked by admin",
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: "rejected" }
            : req,
        ),
      );

      if (onRefresh) {
        await onRefresh();
      }

      setPopup({
        open: true,
        title: "Request Revoked",
        message:
          "The request was rejected/revoked and any linked device was released.",
        type: "info",
      });
    } catch (err) {
      console.error("Failed to reject request", err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
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
        <h2 className="device-requests-title">{title}</h2>
        <p className="device-requests-subtitle">{subtitle}</p>
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
          const cycleImages = getCycleImages(request);
          const canEditCycleImages =
            request.status === "pending" ||
            ((request.status === "consent_pending" ||
              request.status === "active") &&
              request.assignment_details &&
              !request.assignment_details.consent_approved);

          return (
            <div key={request.id} className="device-request-card">
              <div
                className="device-request-header"
                onClick={() => toggleExpanded(request.id)}
              >
                <div className="device-request-title-section">
                  <div className={`device-request-status-badge status-${statusClass}`}>
                    {statusClass.charAt(0).toUpperCase() +
                      statusClass.slice(1).replace(/_/g, " ")}
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
                          {request.created_at
                            ? new Date(request.created_at).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="device-request-section">
                    <h4 className="device-request-section-title">Images</h4>
                    <div className="device-request-images-panel">
                      <p className="device-request-images-help">
                        Add the latest device photos for this request cycle before
                        asking the employee to fill the consent form.
                      </p>

                      {canEditCycleImages && (
                        <div className="device-request-image-toolbar">
                          <label className="device-request-upload-btn">
                            <Upload size={16} />
                            <span>
                              {uploadingImageByRequestId[request.id]
                                ? "Uploading..."
                                : "Add Latest Image"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                handleCycleImageUpload(request, event)
                              }
                              disabled={uploadingImageByRequestId[request.id]}
                            />
                          </label>

                          {request.assignment_details &&
                            hasCycleImageChanges(request) && (
                              <button
                                className="btn-save-images"
                                onClick={() => handleSaveCycleImages(request)}
                                disabled={isProcessing}
                              >
                                {isProcessing &&
                                processingAction === "save_cycle_images"
                                  ? "Saving..."
                                  : "Save Images"}
                              </button>
                            )}
                        </div>
                      )}

                      {cycleImages.length > 0 ? (
                        <div className="device-request-images-grid">
                          {cycleImages.map((imageUrl, idx) => (
                            <div key={`${request.id}-${idx}`} className="device-request-image-card">
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="device-request-image-thumbnail"
                              >
                                <img src={imageUrl} alt={`Device ${idx + 1}`} />
                              </a>
                              {canEditCycleImages && (
                                <button
                                  className="device-request-remove-image"
                                  onClick={() => handleRemoveCycleImage(request, idx)}
                                  type="button"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="device-request-empty-images">
                          No latest device images added yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {request.assignment_details &&
                    Object.keys(
                      request.assignment_details.consent_form_data || {},
                    ).length > 0 && (
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
                              {request.assignment_details.consent_form_data.accessories ||
                                "None"}
                            </span>
                          </div>

                          {request.assignment_details.consent_images?.length > 0 && (
                            <div className="device-request-consent-images">
                              <span className="device-request-label">
                                User Uploaded Photos
                              </span>
                              <div className="device-request-images-grid">
                                {request.assignment_details.consent_images.map(
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

                  {request.assignment_details &&
                    Object.keys(
                      request.assignment_details.return_form_data || {},
                    ).length > 0 && (
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
                            <span className="device-request-label">
                              Device Condition at Return
                            </span>
                            <span className="device-request-value">
                              {request.assignment_details.return_form_data.condition}
                            </span>
                          </div>
                          <div className="device-request-return-item">
                            <span className="device-request-label">
                              Accessories Returned
                            </span>
                            <span className="device-request-value">
                              {request.assignment_details.return_form_data.accessories ||
                                "None"}
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

                  <div className="device-request-actions">
                    {request.status === "pending" && (
                      <>
                        <button
                          className="btn-device-grant"
                          onClick={() => handleSendForConsent(request)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "send_for_consent"
                            ? "Sending..."
                            : "Ask for Consent"}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectClick(request.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "revoke"
                            ? "Revoking..."
                            : "Reject / Revoke"}
                        </button>
                      </>
                    )}

                    {(request.status === "consent_pending" ||
                      request.status === "active") &&
                      request.assignment_details &&
                      Object.keys(
                        request.assignment_details.consent_form_data || {},
                      ).length > 0 &&
                      !request.assignment_details.consent_approved && (
                        <button
                          className="btn-approve-consent"
                          onClick={() =>
                            handleApproveConsent(
                              request.assignment_details.id,
                              request.id,
                            )
                          }
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "approve_consent"
                            ? "Verifying..."
                            : "Verify & Grant Device"}
                        </button>
                      )}

                    {(request.status === "consent_pending" ||
                      request.status === "active") &&
                      request.assignment_details &&
                      request.assignment_details.return_form_pending && (
                        <button
                          className="btn-approve-return"
                          onClick={() =>
                            handleApproveReturn(
                              request.assignment_details.id,
                              request.id,
                            )
                          }
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "approve_return"
                            ? "Approving Return..."
                            : "Confirm Device Return"}
                        </button>
                      )}

                    {(request.status === "consent_pending" ||
                      request.status === "active") && (
                      <button
                        className="btn-reject"
                        onClick={() => handleRejectClick(request.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing && processingAction === "revoke"
                          ? "Revoking..."
                          : "Reject / Revoke"}
                      </button>
                    )}

                    {(request.status === "rejected" ||
                      request.status === "returned") && (
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

      <PopupModal
        open={rejectReasonModal.open}
        title="Revoke Device Request"
        message="Please provide a reason for revoking this device request."
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
            label: "Confirm Revoke",
            onClick: handleConfirmReject,
          },
        ]}
        onClose={() => {
          setRejectReasonModal({ open: false, requestId: null });
          setRejectReason("");
        }}
      />

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
