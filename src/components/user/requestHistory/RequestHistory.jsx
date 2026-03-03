import React, { useState, useEffect } from "react";
import { inventoryAPI } from "../../../services/api";
import "./RequestHistory.css";

const RequestHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await inventoryAPI.getMyTickets();
      const all = Array.isArray(res.data) ? res.data : res.data.results || [];
      // filter out issue tickets (they are shown elsewhere)
      const filtered = all.filter(
        (t) => t.ticket_type !== "issue",
      );
      setTickets(filtered);
    } catch (err) {
      console.error("RequestHistory error:", err);
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };
  const getStatusClass = (status) => {
    // map backend statuses to css classes
    switch (status) {
      case "pending":
        return "rh-status-pending";
      case "in_progress":
        return "rh-status-approved";
      case "resolved":
        return "rh-status-approved"; // reuse approved style
      case "rejected":
        return "rh-status-declined";
      case "closed":
        return "rh-status-approved";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "○";
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
          {Array.from(new Set(tickets.map((t) => t.status))).map((stat) => {
            const label = stat.replace(/_/g, " ");
            const count = tickets.filter((t) => t.status === stat).length;
            const chipClass = stat === "pending" ? "pending" : stat === "rejected" ? "declined" : "approved";
            return (
              <span key={stat} className={`rh-filter-chip ${chipClass}`}>
                {label.charAt(0).toUpperCase() + label.slice(1)} ({count})
              </span>
            );
          })}
        </div>
      </div>
      <div className="rh-tickets-list">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rh-ticket-card">
            <div className="rh-ticket-main">
              <div className="rh-ticket-left">
                <div
                  className={`rh-status-badge ${getStatusClass(ticket.status)}`}
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
                  {ticket.status === "in_progress" && ticket.updated_at && (
                    <div className="rh-date-item">
                      <span className="rh-date-label">Updated</span>
                      <span className="rh-date-value">
                        {formatDate(ticket.updated_at)}
                      </span>
                    </div>
                  )}
                  {ticket.status === "rejected" && ticket.updated_at && (
                    <div className="rh-date-item">
                      <span className="rh-date-label">Rejected</span>
                      <span className="rh-date-value">
                        {formatDate(ticket.updated_at)}
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
