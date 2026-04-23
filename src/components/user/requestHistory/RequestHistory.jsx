import React from "react";
import "./RequestHistory.css";

const RequestHistory = ({
  requests = [],
  loading = false,
  error = null,
}) => {
  const getStatusClass = (status) => {
    // map backend statuses to css classes
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
      default:
        return "";
    }
  };
  const hasActiveRequest = requests.some(
  (req) => req.status === "pending" || req.status === "approved"
);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="rh-section-header">
        <h2>Request History</h2>
        <p>Loading device requests...</p>
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

  return (
    <div className="rh-section-header">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Request History</h2>

        <button
          className="rh-request-btn"
          disabled={hasActiveRequest}
          onClick={() => {
            // call your API or open request modal
            console.log("Request Device clicked");
          }}
        >
          {hasActiveRequest ? "Request Already Raised" : "Request Device"}
        </button>
      </div>

      {!requests.length && (
        <div className="rh-tickets-list">
          <div className="rh-ticket-card">
            <div className="rh-ticket-main">
              <div className="rh-ticket-left">
                <div className="rh-ticket-info">
                  <h3 className="rh-ticket-id">No requests yet</h3>
                  <p className="rh-ticket-type">
                    Your device request updates will appear here automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rh-filter-chips">
        {Array.from(new Set(requests.map((t) => t.status))).map((stat) => {
          const label = stat.replace(/_/g, " ");
          const count = requests.filter((t) => t.status === stat).length;
          const chipClass = stat === "pending" ? "pending" : stat === "rejected" ? "declined" : "approved";
          return (
            <span key={stat} className={`rh-filter-chip ${chipClass}`}>
              {label.charAt(0).toUpperCase() + label.slice(1)} ({count})
            </span>
          );
        })}
      </div>

      <div className="rh-tickets-list">
        {requests.map((request) => (
          <div key={request.id} className="rh-ticket-card">
            <div className="rh-ticket-main">
              <div className="rh-ticket-left">
                <div
                  className={`rh-status-badge ${getStatusClass(request.status)}`}
                >
                  <span className="rh-status-icon">
                    {getStatusIcon(request.status)}
                  </span>
                  <span className="rh-status-text">{request.status}</span>
                </div>
                <div className="rh-ticket-info">
                  <h3 className="rh-ticket-id">{request.id}</h3>
                  <p className="rh-ticket-type">{request.device_type}</p>
                  <p className="rh-ticket-item">
                    {request.brand} {request.model}
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
                  {request.status === "approved" && request.approved_at && (
                    <div className="rh-date-item">
                      <span className="rh-date-label">Approved</span>
                      <span className="rh-date-value">
                        {formatDate(request.approved_at)}
                      </span>
                    </div>
                  )}
                  {request.status === "rejected" && request.updated_at && (
                    <div className="rh-date-item">
                      <span className="rh-date-label">Rejected</span>
                      <span className="rh-date-value">
                        {formatDate(request.updated_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {request.reason && (
              <div className="rh-ticket-notes">
                <span className="rh-notes-label">Request Reason:</span>
                <span className="rh-notes-text">{request.reason}</span>
                {request.approved_by_details && (
                  <span className="rh-reviewer">
                    {' '}
                    • Approved by {request.approved_by_details.full_name}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestHistory;
