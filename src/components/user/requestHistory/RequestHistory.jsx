// import React from "react";
// import "./RequestHistory.css";

// const RequestHistory = ({
//   requests = [],
//   loading = false,
//   error = null,
// }) => {
//   const getStatusClass = (status) => {
//     // map backend statuses to css classes
//     switch (status) {
//       case "pending":
//         return "rh-status-pending";
//       case "approved":
//       case "assigned":
//       case "in_progress":
//       case "resolved":
//       case "closed":
//         return "rh-status-approved";
//       case "rejected":
//         return "rh-status-declined";
//       default:
//         return "";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "pending":
//         return "○";
//       case "approved":
//       case "assigned":
//       case "in_progress":
//       case "resolved":
//       case "closed":
//         return "✓";
//       case "rejected":
//         return "✕";
//       default:
//         return "";
//     }
//   };
//   const hasActiveRequest = requests.some(
//   (req) => req.status === "pending" || req.status === "approved"
// );

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="rh-section-header">
//         <h2>Request History</h2>
//         <p>Loading device requests...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="rh-section-header">
//         <h2>Request History</h2>
//         <p style={{ color: "#d32f2f" }}>Error: {error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="rh-section-header">
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h2>Request History</h2>

//         <button
//           className="rh-request-btn"
//           disabled={hasActiveRequest}
//           onClick={() => {
//             // call your API or open request modal
//             console.log("Request Device clicked");
//           }}
//         >
//           {hasActiveRequest ? "Request Already Raised" : "Request Device"}
//         </button>
//       </div>

//       {!requests.length && (
//         <div className="rh-tickets-list">
//           <div className="rh-ticket-card">
//             <div className="rh-ticket-main">
//               <div className="rh-ticket-left">
//                 <div className="rh-ticket-info">
//                   <h3 className="rh-ticket-id">No requests yet</h3>
//                   <p className="rh-ticket-type">
//                     Your device request updates will appear here automatically.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="rh-filter-chips">
//         {Array.from(new Set(requests.map((t) => t.status))).map((stat) => {
//           const label = stat.replace(/_/g, " ");
//           const count = requests.filter((t) => t.status === stat).length;
//           const chipClass = stat === "pending" ? "pending" : stat === "rejected" ? "declined" : "approved";
//           return (
//             <span key={stat} className={`rh-filter-chip ${chipClass}`}>
//               {label.charAt(0).toUpperCase() + label.slice(1)} ({count})
//             </span>
//           );
//         })}
//       </div>

//       <div className="rh-tickets-list">
//         {requests.map((request) => (
//           <div key={request.id} className="rh-ticket-card">
//             <div className="rh-ticket-main">
//               <div className="rh-ticket-left">
//                 <div
//                   className={`rh-status-badge ${getStatusClass(request.status)}`}
//                 >
//                   <span className="rh-status-icon">
//                     {getStatusIcon(request.status)}
//                   </span>
//                   <span className="rh-status-text">{request.status}</span>
//                 </div>
//                 <div className="rh-ticket-info">
//                   <h3 className="rh-ticket-id">{request.id}</h3>
//                   <p className="rh-ticket-type">{request.device_type}</p>
//                   <p className="rh-ticket-item">
//                     {request.brand} {request.model}
//                   </p>
//                 </div>
//               </div>
//               <div className="rh-ticket-right">
//                 <div className="rh-ticket-dates">
//                   <div className="rh-date-item">
//                     <span className="rh-date-label">Requested</span>
//                     <span className="rh-date-value">
//                       {formatDate(request.created_at)}
//                     </span>
//                   </div>
//                   {request.status === "approved" && request.approved_at && (
//                     <div className="rh-date-item">
//                       <span className="rh-date-label">Approved</span>
//                       <span className="rh-date-value">
//                         {formatDate(request.approved_at)}
//                       </span>
//                     </div>
//                   )}
//                   {request.status === "rejected" && request.updated_at && (
//                     <div className="rh-date-item">
//                       <span className="rh-date-label">Rejected</span>
//                       <span className="rh-date-value">
//                         {formatDate(request.updated_at)}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             {request.reason && (
//               <div className="rh-ticket-notes">
//                 <span className="rh-notes-label">Request Reason:</span>
//                 <span className="rh-notes-text">{request.reason}</span>
//                 {request.approved_by_details && (
//                   <span className="rh-reviewer">
//                     {' '}
//                     • Approved by {request.approved_by_details.full_name}
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RequestHistory;
import React, { useMemo, useState } from "react";
import "./RequestHistory.css";
import { inventoryAPI } from "../../../services/api";
import ConsentForm from "../../common/ConsentForm";
import PopupModal from "../../common/PopupModal";
import { SectionSkeleton } from "../../common/SkeletonView";

const RequestHistory = ({
  requests = [],
  loading = false,
  error = null,
  onRequestDevice,
  onRefresh,
}) => {
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentAssignment, setConsentAssignment] = useState(null);
  const [activeConsentRequestId, setActiveConsentRequestId] = useState(null);
  const [submittedConsentRequestIds, setSubmittedConsentRequestIds] = useState(
    new Set(),
  );
  const [submittedConsentAtByRequestId, setSubmittedConsentAtByRequestId] =
    useState({});
  const [openingConsentRequestId, setOpeningConsentRequestId] = useState(null);
  const [submittingConsent, setSubmittingConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "rh-status-pending";
      case "approved":
      case "assigned":
      case "in_progress":
      case "resolved":
      case "closed":
        return "rh-status-approved";
      case "rejected":
        return "rh-status-declined";
      case "consent_pending":
        return "rh-status-consent";
      case "returned":
        return "rh-status-returned";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "○";
      case "approved":
      case "assigned":
      case "in_progress":
      case "resolved":
      case "closed":
        return "✓";
      case "rejected":
        return "✕";
      case "consent_pending":
        return "!";
      case "returned":
        return "↩";
      default:
        return "";
    }
  };

  const getStatusLabel = (status) => {
    if (status === "consent_pending") return "Consent Pending";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const hasActiveRequest = requests.some(
    (req) =>
      req.status === "pending" ||
      req.status === "approved" ||
      req.status === "consent_pending" ||
      req.status === "active"
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusCounts = useMemo(
    () =>
      requests.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}),
    [requests],
  );

  if (loading) {
    return (
      <div className="rh-section-header">
        <SectionSkeleton lines={4} cards={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rh-section-header">
        <h2>Request History</h2>
        <p style={{ color: "#d32f2f" }}>Error: {error}</p>
      </div>
    );
  }

  const normalizeRequestObject = (maybeResponseData) => {
    // Some endpoints return { request: {...} }, others return the request object directly
    return maybeResponseData?.request || maybeResponseData;
  };

  const deriveAssignmentFromRequest = (req, fetched) => {
    const fetchedReq = normalizeRequestObject(fetched);
    const raw =
      fetchedReq?.assignment_details ||
      fetchedReq?.assignment ||
      req?.assignment_details ||
      req?.assignment ||
      null;
    return raw;
  };

  const deriveAssignmentIdFromRequest = (req, fetched) => {
    const fetchedReq = normalizeRequestObject(fetched);
    const candidate =
      fetchedReq?.assignment_id ||
      fetchedReq?.assignment ||
      req?.assignment_id ||
      req?.assignment ||
      null;
    // assignment sometimes is an object, sometimes an id
    if (candidate && typeof candidate === "object") return candidate.id || null;
    return candidate || null;
  };

  const openConsentForm = async (request) => {
    setConsentError("");
    setOpeningConsentRequestId(request?.id ?? null);
    try {
      // Prefer assignment already embedded in the request list
      let assignment = deriveAssignmentFromRequest(request, null);

      // If not present, fetch the request details to get assignment_details
      let requestDetails = null;
      if (!assignment) {
        const response = await inventoryAPI.getDeviceRequest(request.id);
        requestDetails = response.data;
        assignment = deriveAssignmentFromRequest(request, requestDetails);
      }

      // If still not present, try resolving assignment by id (backend might return assignment_id only)
      if (!assignment) {
        const assignmentId = deriveAssignmentIdFromRequest(request, requestDetails);
        if (assignmentId) {
          const assignmentRes = await inventoryAPI.getAssignment(assignmentId);
          assignment = assignmentRes.data;
        }
      }

      if (!assignment || !assignment.id) {
        throw new Error(
          "Consent form is not available for this request yet. (Assignment not created)",
        );
      }

      setConsentAssignment(assignment);
      setActiveConsentRequestId(request.id);
      setConsentOpen(true);
    } catch (err) {
      console.error("Failed to open consent form", err);
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Unable to open consent form";
      setConsentError(message);
      setPopup({
        open: true,
        title: "Unable to Open Consent",
        message,
        type: "error",
      });
    } finally {
      setOpeningConsentRequestId(null);
    }
  };

  const handleSubmitConsent = async (consentData) => {
    if (!consentAssignment?.id) return;
    setSubmittingConsent(true);
    setConsentError("");
    try {
      await inventoryAPI.submitConsent(consentAssignment.id, consentData);

      if (activeConsentRequestId) {
        setSubmittedConsentRequestIds((prev) => {
          const next = new Set(prev);
          next.add(activeConsentRequestId);
          return next;
        });
        setSubmittedConsentAtByRequestId((prev) => ({
          ...prev,
          [activeConsentRequestId]: new Date().toISOString(),
        }));
      }

      setConsentOpen(false);
      setConsentAssignment(null);
      setActiveConsentRequestId(null);
      setPopup({
        open: true,
        title: "Consent Form Submitted",
        message:
          "Your consent form is submitted successfully. Please wait for admin approval.",
        type: "success",
      });
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Error submitting consent:", err);
      setConsentError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Failed to submit consent form",
      );
    } finally {
      setSubmittingConsent(false);
    }
  };

  const isConsentSubmitted = (request) =>
    submittedConsentRequestIds.has(request?.id) ||
    Boolean(
      request?.assignment_details?.consent_form_data &&
        Object.keys(request.assignment_details.consent_form_data || {}).length > 0,
    );

  const getCycleImages = (request) =>
    Array.isArray(request?.assignment_details?.cycle_images)
      ? request.assignment_details.cycle_images
      : [];

  return (
    <>
    <div className="rh-section-header">
      {/* Top bar */}
      <div className="rh-topbar">
        <div className="rh-topbar-left">
          <h2>Request History</h2>
          <p className="rh-subtitle">
            Track all your device requests and their status
          </p>
        </div>
        <button
          className="rh-request-btn"
          disabled={hasActiveRequest}
          onClick={() => {
            if (onRequestDevice) onRequestDevice();
          }}
        >
          {hasActiveRequest
            ? "Request Already Raised"
            : "Request Device"}
        </button>
      </div>

      {/* Summary */}
      {requests.length > 0 && (
        <div className="rh-summary-row">
          {statusCounts["consent_pending"] > 0 && (
            <div className="rh-stat-card">
              <div className="rh-stat-icon rh-stat-consent">📋</div>
              <div className="rh-stat-info">
                <div className="rh-stat-val">
                  {statusCounts["consent_pending"]}
                </div>
                <div className="rh-stat-lbl">Consent Pending</div>
              </div>
            </div>
          )}

          {statusCounts["pending"] > 0 && (
            <div className="rh-stat-card">
              <div className="rh-stat-icon rh-stat-pending">⏳</div>
              <div className="rh-stat-info">
                <div className="rh-stat-val">
                  {statusCounts["pending"]}
                </div>
                <div className="rh-stat-lbl">Pending</div>
              </div>
            </div>
          )}

          {(
            (statusCounts["approved"] || 0) +
            (statusCounts["assigned"] || 0) +
            (statusCounts["in_progress"] || 0) +
            (statusCounts["resolved"] || 0) +
            (statusCounts["closed"] || 0)
          ) > 0 && (
            <div className="rh-stat-card">
              <div className="rh-stat-icon rh-stat-approved">✅</div>
              <div className="rh-stat-info">
                <div className="rh-stat-val">
                  {(statusCounts["approved"] || 0) +
                    (statusCounts["assigned"] || 0) +
                    (statusCounts["in_progress"] || 0) +
                    (statusCounts["resolved"] || 0) +
                    (statusCounts["closed"] || 0)}
                </div>
                <div className="rh-stat-lbl">Approved / Active</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request list */}
      <div className="rh-list">
        {requests.map((request) => (
          <div
            key={request.id}
            className={`rh-ticket-card rh-card-${
              request.status === "consent_pending"
                ? "consent"
                : request.status === "pending"
                ? "pending"
                : request.status === "returned"
                ? "returned"
                : request.status === "rejected"
                ? "declined"
                : "approved"
            }`}
          >
            <div className="rh-ticket-main">
              <div className="rh-ticket-left">
                <div
                  className={`rh-status-badge ${getStatusClass(
                    request.status
                  )}`}
                >
                  <span className="rh-status-icon">
                    {getStatusIcon(request.status)}
                  </span>
                  <span className="rh-status-text">
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                <div className="rh-ticket-info">
                  <h3 className="rh-ticket-id">{request.id}</h3>
                  <p className="rh-ticket-type">
                    {request.device_type ||
                      request.assignment_details?.device_details?.device_type ||
                      "—"}
                  </p>
                  <p className="rh-ticket-item">
                    {(
                      request.assignment_details?.device_details?.name ||
                      [request.brand, request.model]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                      [
                        request.assignment_details?.device_details?.brand,
                        request.assignment_details?.device_details?.model,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                      "—"
                    ).trim()}
                  </p>
                </div>
              </div>

              <div className="rh-ticket-right">
                <div className="rh-ticket-dates">
                  <div className="rh-date-item">
                    <span className="rh-date-label">Requested</span>
                    <span className="rh-date-value">
                      {formatDate(request.created_at)}
                    </span>
                  </div>

                  {request.status === "approved" &&
                    request.approved_at && (
                      <div className="rh-date-item">
                        <span className="rh-date-label">
                          Approved
                        </span>
                        <span className="rh-date-value">
                          {formatDate(request.approved_at)}
                        </span>
                      </div>
                    )}

                  {request.status === "rejected" &&
                    request.updated_at && (
                      <div className="rh-date-item">
                        <span className="rh-date-label">
                          Rejected
                        </span>
                        <span className="rh-date-value">
                          {formatDate(request.updated_at)}
                        </span>
                      </div>
                    )}

                  {request.status === "returned" &&
                    request.updated_at && (
                      <div className="rh-date-item">
                        <span className="rh-date-label">
                          Returned
                        </span>
                        <span className="rh-date-value">
                          {formatDate(request.updated_at)}
                        </span>
                      </div>
                    )}
                </div>

                {request.status === "consent_pending" &&
                  (isConsentSubmitted(request) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button className="rh-consent-btn" disabled>
                        Awaiting Response
                      </button>
                      <small style={{ color: "#6b7280" }}>
                        Submitted at{" "}
                        {new Date(
                          submittedConsentAtByRequestId[request.id] ||
                            request.assignment_details?.updated_at ||
                            request.updated_at ||
                            request.created_at,
                        ).toLocaleString()}
                      </small>
                    </div>
                  ) : getCycleImages(request).length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button className="rh-consent-btn" disabled>
                        Waiting for Device Images
                      </button>
                      <small style={{ color: "#6b7280" }}>
                        Admin will add the latest device photos before consent.
                      </small>
                    </div>
                  ) : (
                    <button
                      className="rh-consent-btn"
                      onClick={() => openConsentForm(request)}
                      disabled={openingConsentRequestId === request.id}
                    >
                      {openingConsentRequestId === request.id
                        ? "Opening..."
                        : "Fill Consent →"}
                    </button>
                  ))}
              </div>
            </div>

            {request.reason && (
              <div className="rh-ticket-notes">
                <span className="rh-notes-label">
                  Request Reason:
                </span>
                <span className="rh-notes-text">
                  {request.reason}
                </span>
              </div>
            )}

            {getCycleImages(request).length > 0 && (
              <div className="rh-images-panel">
                <div className="rh-images-head">
                  <strong>Images</strong>
                  <span>Latest device photos shared by admin for this request cycle</span>
                </div>
                <div className="rh-images-grid">
                  {getCycleImages(request).map((imageUrl, index) => (
                    <a
                      key={`${request.id}-cycle-${index}`}
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rh-image-card"
                    >
                      <img src={imageUrl} alt={`Device ${index + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {consentError && (
        <div style={{ color: "#d32f2f", marginTop: 10 }}>
          {consentError}
        </div>
      )}

      {consentOpen && consentAssignment && (
        <ConsentForm
          assignment={consentAssignment}
          isOpen={consentOpen}
          onClose={() => {
            setConsentOpen(false);
            setConsentAssignment(null);
            setActiveConsentRequestId(null);
          }}
          onSubmit={handleSubmitConsent}
          isLoading={submittingConsent}
        />
      )}
    </div>

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

export default RequestHistory;
