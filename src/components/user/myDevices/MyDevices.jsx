// import React, { useState, useEffect } from "react";
// import { inventoryAPI } from "../../../services/api";
// import { useAuth } from "../../../AuthContext/AuthContext";
// import { mockDevices, mockAssignments } from "../../../assets/data/mockData";
// import { Clock, AlertCircle } from "lucide-react";
// import LoadingSpinner from "../../common/LoadingSpinner";
// import "./MyDevices.css";

// const MyDevices = () => {
//   const { user } = useAuth();
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [countdowns, setCountdowns] = useState({});

//   useEffect(() => {
//     fetchAssignments();
//     // Update countdowns every minute
//     const interval = setInterval(updateCountdowns, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     // Initial countdown update
//     updateCountdowns();
//   }, [assignments]);

//   const updateCountdowns = () => {
//     const now = new Date();
//     const newCountdowns = {};

//     assignments.forEach((assignment) => {
//       if (assignment.expected_return_date) {
//         const returnDate = new Date(assignment.expected_return_date);
//         const diffMs = returnDate - now;
//         const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//         const diffHours = Math.floor(
//           (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
//         );
//         const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

//         newCountdowns[assignment.id] = {
//           days: Math.max(0, diffDays),
//           hours: Math.max(0, diffHours),
//           minutes: Math.max(0, diffMinutes),
//           isOverdue: diffMs < 0,
//           isUrgent: diffDays <= 3 && diffMs >= 0,
//         };
//       }
//     });

//     setCountdowns(newCountdowns);
//   };

//   const fetchAssignments = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await inventoryAPI.getMyAssignments();
//       const assignmentsList = Array.isArray(res.data)
//         ? res.data
//         : res.data.results || [];

//       if (assignmentsList.length === 0) {
//         // Fallback to mock data if needed
//         setAssignments([]);
//       } else {
//         setAssignments(assignmentsList);
//       }
//     } catch (err) {
//       console.error("Failed to fetch assignments:", err);
//       setError(err.message || "Error loading devices");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const handleExtendReturn = async (assignmentId) => {
//     // This would call an API endpoint to extend the return date
//     // For now, just show a message
//     alert("Return extension feature coming soon!");
//   };

//   if (loading) {
//     return (
//       <div className="md-content-section">
//         <LoadingSpinner fullScreen={false} message="Loading your devices..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="md-content-section" style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
//         Error: {error}
//       </div>
//     );
//   }

//   return (
//     <div className="md-content-section">
//       <div className="md-section-header">
//         <h2>Assigned Devices</h2>
//         <span className="md-device-count">{assignments.length} devices</span>
//       </div>
//       <div className="md-devices-grid">
//         {assignments.map((assignment) => {
//           const device = assignment.device_details;
//           const countdown = countdowns[assignment.id];

//           return (
//             <div key={assignment.id} className="md-device-card">
//               <div className="md-device-header">
//                 {device?.image_url && (
//                   <img
//                     src={device.image_url}
//                     alt="device"
//                     className="md-device-image"
//                   />
//                 )}
//                 <span className="md-device-type">{device?.device_type}</span>
//                 <span
//                   className={`md-device-status ${assignment.status.toLowerCase()}`}
//                 >
//                   {assignment.status.replace(/_/g, " ")}
//                 </span>
//               </div>
//               <h3 className="md-device-name">
//                 {device?.brand} {device?.model}
//               </h3>
//               <div className="md-device-details">
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Device ID</span>
//                   <span className="md-detail-value">{device?.device_id}</span>
//                 </div>
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Serial Number</span>
//                   <span className="md-detail-value">{device?.serial_number}</span>
//                 </div>
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Assigned Date</span>
//                   <span className="md-detail-value">
//                     {formatDate(assignment.assigned_date)}
//                   </span>
//                 </div>
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Condition</span>
//                   <span className="md-detail-value">{device?.condition}</span>
//                 </div>

//                 {/* Return Due Countdown */}
//                 {countdown && (
//                   <div
//                     className={`md-return-countdown ${
//                       countdown.isOverdue
//                         ? "overdue"
//                         : countdown.isUrgent
//                         ? "urgent"
//                         : ""
//                     }`}
//                   >
//                     <div className="countdown-header">
//                       <Clock size={16} />
//                       <span>Return Due</span>
//                     </div>
//                     {countdown.isOverdue ? (
//                       <div className="countdown-overdue">
//                         <AlertCircle size={18} />
//                         <span>OVERDUE!</span>
//                       </div>
//                     ) : (
//                       <div className="countdown-timer">
//                         <span className="countdown-value">
//                           {countdown.days}d {countdown.hours}h {countdown.minutes}m
//                         </span>
//                         <span className="return-date">
//                           {formatDate(assignment.expected_return_date)}
//                         </span>
//                       </div>
//                     )}
//                     <button
//                       className="btn-extend"
//                       onClick={() => handleExtendReturn(assignment.id)}
//                     >
//                       Extend Return
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default MyDevices;

import React, { useEffect, useMemo, useState } from "react";
import { inventoryAPI } from "../../../services/api";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { SectionSkeleton } from "../../common/SkeletonView";
import PopupModal from "../../common/PopupModal";
import "./MyDevices.css";

const getStatusLabel = (value) =>
  (value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildDeviceName = (device = {}) =>
  [device.brand, device.model].filter(Boolean).join(" ").trim() ||
  device.name ||
  "Assigned device";

const getApiResults = (response) =>
  Array.isArray(response?.data) ? response.data : response?.data?.results || [];

const MyDevices = () => {
  const [assignments, setAssignments] = useState([]);
  const [inventoryAssets, setInventoryAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [claimingAssetId, setClaimingAssetId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [extensionForm, setExtensionForm] = useState({
    requestedDate: "",
    reason: "",
  });
  const [extensionError, setExtensionError] = useState("");
  const [extensionSubmitting, setExtensionSubmitting] = useState(false);
  const [extensionRequestsByAssignment, setExtensionRequestsByAssignment] =
    useState({});
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchWorkspaceDevices();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateCountdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments]);

  const updateCountdowns = () => {
    const now = new Date();
    const newCountdowns = {};

    assignments.forEach((assignment) => {
      if (assignment.expected_return_date) {
        const returnDate = new Date(assignment.expected_return_date);
        const diffMs = returnDate - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        newCountdowns[assignment.id] = {
          days: Math.max(0, diffDays),
          hours: Math.max(0, diffHours),
          minutes: Math.max(0, diffMinutes),
          isOverdue: diffMs < 0,
          isUrgent: diffDays <= 3 && diffMs >= 0,
        };
      }
    });

    setCountdowns(newCountdowns);
  };

  const fetchWorkspaceDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsResponse, inventoryResponse] = await Promise.all([
        inventoryAPI.getMyAssignments(),
        inventoryAPI.getMyInventory(),
      ]);

      const assignmentsList = getApiResults(assignmentsResponse);
      const inventoryList = getApiResults(inventoryResponse);

      setAssignments(assignmentsList.length === 0 ? [] : assignmentsList);
      setInventoryAssets(inventoryList.length === 0 ? [] : inventoryList);
    } catch (err) {
      console.error("Failed to fetch assigned devices:", err);
      setError(err.message || "Error loading devices");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const visibleAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) => !["returned", "lost", "damaged"].includes(assignment.status),
      ),
    [assignments],
  );
  const visibleInventoryAssets = useMemo(
    () =>
      inventoryAssets.filter((asset) =>
        ["assigned", "pending_claim", "claimed"].includes(asset.status),
      ),
    [inventoryAssets],
  );

  const openDetails = (assignment, openExtensionForm = false) => {
    setSelectedAssignment(assignment);
    setShowExtensionForm(openExtensionForm);
    setExtensionError("");
    setExtensionForm({
      requestedDate:
        assignment.expected_return_date || new Date().toISOString().split("T")[0],
      reason: "",
    });
  };

  const closeDetails = () => {
    setSelectedAssignment(null);
    setShowExtensionForm(false);
    setExtensionError("");
    setExtensionForm({
      requestedDate: "",
      reason: "",
    });
  };

  const handleSubmitExtension = async () => {
    if (!selectedAssignment) return;

    const currentReturnDate = selectedAssignment.expected_return_date;
    if (!extensionForm.requestedDate) {
      setExtensionError("Please choose the new requested return date.");
      return;
    }
    if (
      currentReturnDate &&
      new Date(extensionForm.requestedDate) <= new Date(currentReturnDate)
    ) {
      setExtensionError("Choose a date after the current return date.");
      return;
    }
    if (!extensionForm.reason.trim() || extensionForm.reason.trim().length < 10) {
      setExtensionError("Please add a short reason of at least 10 characters.");
      return;
    }

    const device = selectedAssignment.device_details || {};
    const countdown = countdowns[selectedAssignment.id];

    setExtensionSubmitting(true);
    setExtensionError("");
    try {
      await inventoryAPI.createTicket({
        ticket_type: "return",
        priority: countdown?.isOverdue ? "high" : "medium",
        device: selectedAssignment.device || device.id || null,
        subject: `Return date extension request - ${
          device.device_id || buildDeviceName(device)
        }`,
        description: [
          `Device: ${buildDeviceName(device)}`,
          `Device ID: ${device.device_id || "Not available"}`,
          `Current return date: ${formatDate(currentReturnDate)}`,
          `Requested new return date: ${formatDate(extensionForm.requestedDate)}`,
          `Reason: ${extensionForm.reason.trim()}`,
        ].join("\n"),
      });

      setExtensionRequestsByAssignment((prev) => ({
        ...prev,
        [selectedAssignment.id]: {
          requestedDate: extensionForm.requestedDate,
          requestedAt: new Date().toISOString(),
        },
      }));

      setShowExtensionForm(false);
      setPopup({
        open: true,
        title: "Extension Request Sent",
        message:
          "Your return date extension request was sent to admin and can be tracked from My Tickets.",
        type: "success",
      });
    } catch (err) {
      setExtensionError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit extension request.",
      );
    } finally {
      setExtensionSubmitting(false);
    }
  };

  const handleClaimInventoryAsset = async (assetId) => {
    try {
      setClaimingAssetId(assetId);
      const response = await inventoryAPI.claimAsset(assetId);
      const claimedAsset = response?.data?.asset;

      setInventoryAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetId
            ? {
                ...asset,
                ...(claimedAsset || {}),
                claimed: true,
                pending_claim: false,
                status: "claimed",
                status_display:
                  claimedAsset?.status_display || getStatusLabel("claimed"),
              }
            : asset,
        ),
      );

      setPopup({
        open: true,
        title: "Device Claimed",
        message:
          "Your assigned device has been claimed successfully and will remain visible in My Devices.",
        type: "success",
      });
    } catch (err) {
      setPopup({
        open: true,
        title: "Claim Failed",
        message:
          err.response?.data?.error ||
          err.message ||
          "We could not claim this device right now.",
        type: "error",
      });
    } finally {
      setClaimingAssetId(null);
    }
  };

  if (loading) {
    return (
      <div className="md-content-section">
        <SectionSkeleton lines={4} cards={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-content-section md-error">
        Error: {error}
      </div>
    );
  }

  const selectedDevice = selectedAssignment?.device_details || {};
  const selectedConsentData = selectedAssignment?.consent_form_data || {};
  const selectedConsentImages = Array.isArray(selectedAssignment?.consent_images)
    ? selectedAssignment.consent_images
    : [];
  const selectedCountdown = selectedAssignment
    ? countdowns[selectedAssignment.id]
    : null;
  const selectedExtensionRequest = selectedAssignment
    ? extensionRequestsByAssignment[selectedAssignment.id]
    : null;
  const consentAcknowledgements = Array.isArray(
    selectedConsentData.acknowledgements,
  )
    ? selectedConsentData.acknowledgements
    : [];

  return (
    <>
    <div className="md-content-section">
      <div className="md-section-header">
        <div className="md-header-left">
          <h2>Inventory claims</h2>
          <p className="md-header-sub">
            Review devices assigned to your email and claim them here
          </p>
        </div>
        <span className="md-device-count">
          {visibleInventoryAssets.length}{" "}
          {visibleInventoryAssets.length === 1 ? "device" : "devices"}
        </span>
      </div>

      {visibleInventoryAssets.length === 0 ? (
        <div className="md-empty md-claim-empty">
          <p className="md-empty-title">No inventory waiting for claim</p>
          <p className="md-empty-sub">
            Devices assigned to your email will appear here with a claim action.
          </p>
        </div>
      ) : (
        <div className="md-claim-grid">
          {visibleInventoryAssets.map((asset) => {
            const isPendingClaim = Boolean(asset.pending_claim && !asset.claimed);
            const isClaiming = claimingAssetId === asset.id;

            return (
              <div key={asset.id} className="md-claim-card">
                <div className="md-claim-card-header">
                  <div>
                    <p className="md-claim-eyebrow">{asset.category_display}</p>
                    <h3>{asset.asset_name}</h3>
                  </div>
                  <span
                    className={`md-claim-status ${
                      asset.claimed ? "claimed" : isPendingClaim ? "pending" : "assigned"
                    }`}
                  >
                    {asset.claimed ? (
                      <>
                        <CheckCircle size={14} /> Claimed
                      </>
                    ) : isPendingClaim ? (
                      <>
                        <Clock size={14} /> Pending Claim
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} /> Assigned
                      </>
                    )}
                  </span>
                </div>

                <div className="md-claim-details">
                  <div className="md-claim-row">
                    <span>Serial number</span>
                    <strong>{asset.serial_number || "Not available"}</strong>
                  </div>
                  <div className="md-claim-row">
                    <span>Assigned to</span>
                    <strong>{asset.assigned_person_name || "Not available"}</strong>
                  </div>
                  <div className="md-claim-row">
                    <span>Assigned date</span>
                    <strong>{formatDate(asset.assigned_date)}</strong>
                  </div>
                  <div className="md-claim-row">
                    <span>Condition</span>
                    <strong>{getStatusLabel(asset.condition)}</strong>
                  </div>
                </div>

                <div className="md-card-actions">
                  {isPendingClaim ? (
                    <button
                      type="button"
                      className="md-action-btn md-action-btn-primary"
                      onClick={() => handleClaimInventoryAsset(asset.id)}
                      disabled={isClaiming}
                    >
                      {isClaiming ? "Claiming..." : "Claim device"}
                    </button>
                  ) : (
                    <div className="md-inline-success md-claim-note">
                      {asset.claimed
                        ? "This device is already claimed and linked to your account."
                        : "This device is assigned to you and awaiting the next update."}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="md-section-header">
        <div className="md-header-left">
          <h2>Assigned devices</h2>
          <p className="md-header-sub">Your currently assigned company equipment</p>
        </div>
        <span className="md-device-count">
          {visibleAssignments.length} {visibleAssignments.length === 1 ? "device" : "devices"}
        </span>
      </div>

      {visibleAssignments.length === 0 && (
        <div className="md-empty">
          <p className="md-empty-title">No devices assigned</p>
          <p className="md-empty-sub">Devices assigned to you will appear here.</p>
        </div>
      )}

      <div className="md-devices-grid">
        {visibleAssignments.map((assignment) => {
          const device = assignment.device_details;
          const countdown = countdowns[assignment.id];
          const countdownClass = countdown
            ? countdown.isOverdue
              ? "overdue"
              : countdown.isUrgent
              ? "urgent"
              : "normal"
            : "normal";

          return (
            <div
              key={assignment.id}
              className={`md-device-card md-card-${assignment.status.toLowerCase()}`}
            >
              <div className="md-device-header">
                <span className="md-device-type">
                  {device?.device_type || "device"}
                </span>
                <span className={`md-device-status ${assignment.status.toLowerCase()}`}>
                  {getStatusLabel(assignment.status)}
                </span>
              </div>

              {device?.image_url && (
                <img
                  src={device.image_url}
                  alt="device"
                  className="md-device-image"
                />
              )}

              <h3 className="md-device-name">
                {buildDeviceName(device)}
              </h3>

              <div className="md-device-details">
                <table className="md-detail-table">
                  <tbody>
                    <tr>
                      <td className="md-detail-label">Device ID</td>
                      <td className="md-detail-value">{device?.device_id}</td>
                    </tr>
                    <tr>
                      <td className="md-detail-label">Serial number</td>
                      <td className="md-detail-value">{device?.serial_number}</td>
                    </tr>
                    <tr>
                      <td className="md-detail-label">Assigned date</td>
                      <td className="md-detail-value">
                        {formatDate(assignment.assigned_date)}
                      </td>
                    </tr>
                    <tr>
                      <td className="md-detail-label">Condition</td>
                      <td className="md-detail-value">{device?.condition}</td>
                    </tr>
                    <tr>
                      <td className="md-detail-label">Return date</td>
                      <td className="md-detail-value">
                        {formatDate(assignment.expected_return_date)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {countdown && (
                  <div className={`md-return-countdown ${countdownClass}`}>
                    <div className="countdown-header">
                      <Clock size={13} />
                      <span>
                        {countdown.isOverdue
                          ? "Overdue"
                          : countdown.isUrgent
                          ? "Return due - urgent"
                          : "Return due"}
                      </span>
                    </div>

                    {countdown.isOverdue ? (
                      <div className="countdown-overdue">
                        <AlertCircle size={16} />
                        <span>Return immediately</span>
                      </div>
                    ) : (
                      <div className="countdown-timer">
                        <span className="countdown-value">
                          {countdown.days}d {countdown.hours}h {countdown.minutes}m
                        </span>
                        <span className="return-date">
                          {formatDate(assignment.expected_return_date)}
                        </span>
                      </div>
                    )}

                  </div>
                )}

                <div className="md-card-actions">
                  <button
                    type="button"
                    className="md-action-btn md-action-btn-primary"
                    onClick={() => openDetails(assignment)}
                  >
                    View details
                  </button>
                  {assignment.expected_return_date && (
                    <button
                      type="button"
                      className="md-action-btn md-action-btn-secondary"
                      onClick={() => openDetails(assignment, true)}
                    >
                      Extend return
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {selectedAssignment && (
      <div className="md-modal-overlay" onClick={closeDetails}>
        <div className="md-modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="md-modal-header">
            <div>
              <h3>Assigned Device Details</h3>
              <p>
                Review your device information, consent form data, and return
                schedule.
              </p>
            </div>
            <button
              type="button"
              className="md-modal-close"
              onClick={closeDetails}
              aria-label="Close details"
            >
              <X size={20} />
            </button>
          </div>

          <div className="md-modal-body">
            <div className="md-modal-grid">
              <section className="md-modal-panel">
                <div className="md-modal-device-hero">
                  {selectedDevice.image_url ? (
                    <img
                      src={selectedDevice.image_url}
                      alt={buildDeviceName(selectedDevice)}
                      className="md-modal-device-image"
                    />
                  ) : (
                    <div className="md-modal-device-placeholder">
                      {selectedDevice.device_type || "Device"}
                    </div>
                  )}
                  <div>
                    <p className="md-modal-eyebrow">
                      {selectedDevice.device_id || "Device"}
                    </p>
                    <h4>{buildDeviceName(selectedDevice)}</h4>
                    <span className="md-modal-status">
                      {getStatusLabel(selectedAssignment.status)}
                    </span>
                  </div>
                </div>

                <div className="md-modal-details-list">
                  <div className="md-modal-detail-row">
                    <span>Name</span>
                    <strong>{selectedDevice.name || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Device type</span>
                    <strong>{selectedDevice.device_type || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Brand</span>
                    <strong>{selectedDevice.brand || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Model</span>
                    <strong>{selectedDevice.model || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Serial number</span>
                    <strong>{selectedDevice.serial_number || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Condition</span>
                    <strong>{selectedDevice.condition || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Location</span>
                    <strong>{selectedDevice.location || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Device status</span>
                    <strong>{selectedDevice.status || "Not provided"}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Purchase date</span>
                    <strong>{formatDate(selectedDevice.purchase_date)}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Purchase price</span>
                    <strong>
                      {selectedDevice.purchase_price ?? "Not provided"}
                    </strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Warranty expiry</span>
                    <strong>{formatDate(selectedDevice.warranty_expiry)}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Assigned date</span>
                    <strong>{formatDateTime(selectedAssignment.assigned_date)}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Expected return date</span>
                    <strong>{formatDate(selectedAssignment.expected_return_date)}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Returned on</span>
                    <strong>{formatDateTime(selectedAssignment.return_date)}</strong>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Assigned by</span>
                    <strong>{selectedAssignment.assigned_by_name || "Not available"}</strong>
                  </div>
                </div>

                {selectedDevice.notes && (
                  <div className="md-modal-note">
                    <span>Device notes</span>
                    <p>{selectedDevice.notes}</p>
                  </div>
                )}

                {selectedDevice.specifications &&
                  Object.keys(selectedDevice.specifications).length > 0 && (
                    <div className="md-modal-note">
                      <span>Specifications</span>
                      <div className="md-spec-grid">
                        {Object.entries(selectedDevice.specifications).map(
                          ([key, value]) => (
                            <div key={key} className="md-spec-item">
                              <span>{key.replace(/_/g, " ")}</span>
                              <strong>{String(value)}</strong>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </section>

              <section className="md-modal-panel">
                <div className="md-return-box">
                  <div className="md-return-box-header">
                    <CalendarClock size={18} />
                    <h4>Return schedule</h4>
                  </div>
                  <div className="md-modal-detail-row">
                    <span>Current return date</span>
                    <strong>{formatDate(selectedAssignment.expected_return_date)}</strong>
                  </div>
                  {selectedCountdown && !selectedCountdown.isOverdue && (
                    <div className="md-return-pill">
                      {selectedCountdown.days}d {selectedCountdown.hours}h{" "}
                      {selectedCountdown.minutes}m remaining
                    </div>
                  )}
                  {selectedCountdown?.isOverdue && (
                    <div className="md-return-pill md-return-pill-overdue">
                      Return is overdue
                    </div>
                  )}
                  {selectedExtensionRequest && (
                    <div className="md-inline-success">
                      Extension requested for{" "}
                      {formatDate(selectedExtensionRequest.requestedDate)} on{" "}
                      {formatDateTime(selectedExtensionRequest.requestedAt)}.
                    </div>
                  )}
                  <div className="md-modal-actions">
                    <button
                      type="button"
                      className="md-action-btn md-action-btn-secondary"
                      onClick={() => setShowExtensionForm((prev) => !prev)}
                    >
                      {showExtensionForm ? "Hide extension form" : "Extend return date"}
                    </button>
                  </div>

                  {showExtensionForm && (
                    <div className="md-extension-form">
                      <label>
                        Requested new return date
                        <input
                          type="date"
                          value={extensionForm.requestedDate}
                          min={selectedAssignment.expected_return_date || undefined}
                          onChange={(event) =>
                            setExtensionForm((prev) => ({
                              ...prev,
                              requestedDate: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label>
                        Reason
                        <textarea
                          rows="4"
                          value={extensionForm.reason}
                          onChange={(event) =>
                            setExtensionForm((prev) => ({
                              ...prev,
                              reason: event.target.value,
                            }))
                          }
                          placeholder="Tell admin why you need more time with this device."
                        />
                      </label>
                      {extensionError && (
                        <p className="md-inline-error">{extensionError}</p>
                      )}
                      <button
                        type="button"
                        className="md-action-btn md-action-btn-primary"
                        onClick={handleSubmitExtension}
                        disabled={extensionSubmitting}
                      >
                        {extensionSubmitting ? "Sending..." : "Send extension request"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="md-consent-block">
                  <h4>Consent form details</h4>
                  {Object.keys(selectedConsentData).length === 0 ? (
                    <p className="md-empty-copy">
                      Consent form details will appear here after submission.
                    </p>
                  ) : (
                    <>
                      <div className="md-modal-details-list">
                        <div className="md-modal-detail-row">
                          <span>Employee name</span>
                          <strong>
                            {selectedConsentData.employee_name || "Not provided"}
                          </strong>
                        </div>
                        <div className="md-modal-detail-row">
                          <span>Employee ID</span>
                          <strong>
                            {selectedConsentData.employee_id || "Not provided"}
                          </strong>
                        </div>
                        <div className="md-modal-detail-row">
                          <span>Device name</span>
                          <strong>
                            {selectedConsentData.device_name || "Not provided"}
                          </strong>
                        </div>
                        <div className="md-modal-detail-row">
                          <span>Device ID</span>
                          <strong>
                            {selectedConsentData.device_id || "Not provided"}
                          </strong>
                        </div>
                        <div className="md-modal-detail-row">
                          <span>Received date</span>
                          <strong>
                            {formatDate(selectedConsentData.received_date)}
                          </strong>
                        </div>
                        <div className="md-modal-detail-row">
                          <span>Received condition</span>
                          <strong>
                            {selectedConsentData.condition || "Not provided"}
                          </strong>
                        </div>
                        <div className="md-modal-detail-row">
                          <span>Accessories</span>
                          <strong>
                            {selectedConsentData.accessories || "Not provided"}
                          </strong>
                        </div>
                        <div className="md-modal-detail-row">
                          <span>Responsibility accepted</span>
                          <strong>
                            {selectedConsentData.responsibility_acknowledged
                              ? "Yes"
                              : "No"}
                          </strong>
                        </div>
                      </div>

                      {consentAcknowledgements.length > 0 && (
                        <div className="md-modal-note">
                          <span>Acknowledgements</span>
                          <ul className="md-ack-list">
                            {consentAcknowledgements.map((item, index) => (
                              <li key={`${item.text}-${index}`}>
                                <strong>{item.accepted ? "Accepted" : "Pending"}:</strong>{" "}
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="md-consent-block">
                  <h4>Consent images</h4>
                  {selectedConsentImages.length === 0 ? (
                    <p className="md-empty-copy">
                      Consent images will appear here after upload.
                    </p>
                  ) : (
                    <div className="md-image-grid">
                      {selectedConsentImages.map((imageUrl, index) => (
                        <img
                          key={`${imageUrl}-${index}`}
                          src={imageUrl}
                          alt={`Consent upload ${index + 1}`}
                          className="md-consent-image"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
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
};

export default MyDevices;
