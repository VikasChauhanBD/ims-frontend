import React, { useState } from "react";
import "./RequestHistory.css";

const RequestHistory = () => {
  const [tickets] = useState([
    {
      id: "TKT-2024-045",
      type: "Device Request",
      item: 'iPad Pro 12.9"',
      requestDate: "2024-02-10",
      status: "Approved",
      approvedBy: "John Doe",
      approvalDate: "2024-02-11",
      notes: "Approved for field work requirements",
    },
    {
      id: "TKT-2024-038",
      type: "Device Replacement",
      item: "MacBook Pro Charger",
      requestDate: "2024-02-05",
      status: "Pending",
      notes: "Original charger damaged",
    },
    {
      id: "TKT-2024-022",
      type: "Software License",
      item: "Adobe Creative Cloud",
      requestDate: "2024-01-20",
      status: "Declined",
      declinedBy: "Jane Smith",
      declineDate: "2024-01-22",
      notes: "License already assigned to department",
    },
    {
      id: "TKT-2023-156",
      type: "Device Request",
      item: "Wireless Mouse",
      requestDate: "2023-12-15",
      status: "Approved",
      approvedBy: "Mike Johnson",
      approvalDate: "2023-12-16",
      notes: "Standard accessory approval",
    },
  ]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "rh-status-approved";
      case "pending":
        return "rh-status-pending";
      case "declined":
        return "rh-status-declined";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "✓";
      case "pending":
        return "○";
      case "declined":
        return "✕";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rh-content-section">
      <div className="rh-section-header">
        <h2>Request History</h2>
        <div className="rh-filter-chips">
          <span className="rh-filter-chip approved">
            Approved ({tickets.filter((t) => t.status === "Approved").length})
          </span>
          <span className="rh-filter-chip pending">
            Pending ({tickets.filter((t) => t.status === "Pending").length})
          </span>
          <span className="rh-filter-chip declined">
            Declined ({tickets.filter((t) => t.status === "Declined").length})
          </span>
        </div>
      </div>
      <div className="rh-tickets-list">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rh-ticket-card">
            <div className="rh-ticket-main">
              <div className="rh-ticket-left">
                <div
                  className={`rh-status-badge ${getStatusColor(ticket.status)}`}
                >
                  <span className="rh-status-icon">
                    {getStatusIcon(ticket.status)}
                  </span>
                  <span className="rh-status-text">{ticket.status}</span>
                </div>
                <div className="rh-ticket-info">
                  <h3 className="rh-ticket-id">{ticket.id}</h3>
                  <p className="rh-ticket-type">{ticket.type}</p>
                  <p className="rh-ticket-item">{ticket.item}</p>
                </div>
              </div>
              <div className="rh-ticket-right">
                <div className="rh-ticket-dates">
                  <div className="rh-date-item">
                    <span className="rh-date-label">Requested</span>
                    <span className="rh-date-value">
                      {formatDate(ticket.requestDate)}
                    </span>
                  </div>
                  {ticket.status === "Approved" && ticket.approvalDate && (
                    <div className="rh-date-item">
                      <span className="rh-date-label">Approved</span>
                      <span className="rh-date-value">
                        {formatDate(ticket.approvalDate)}
                      </span>
                    </div>
                  )}
                  {ticket.status === "Declined" && ticket.declineDate && (
                    <div className="rh-date-item">
                      <span className="rh-date-label">Declined</span>
                      <span className="rh-date-value">
                        {formatDate(ticket.declineDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {ticket.notes && (
              <div className="rh-ticket-notes">
                <span className="rh-notes-label">Notes:</span>
                <span className="rh-notes-text">{ticket.notes}</span>
                {ticket.approvedBy && (
                  <span className="rh-reviewer">
                    {" "}
                    • Approved by {ticket.approvedBy}
                  </span>
                )}
                {ticket.declinedBy && (
                  <span className="rh-reviewer">
                    {" "}
                    • Declined by {ticket.declinedBy}
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
