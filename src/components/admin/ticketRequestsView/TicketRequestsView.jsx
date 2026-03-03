import React from "react";
import "./TicketRequestsView.css";
import { inventoryAPI } from "../../../services/api";

export default function TicketRequestsView({
  tickets,
  setTickets,
  devices,
  employees,
  onRefresh,
}) {
  const getDeviceName = (id) => {
    if (!id) return "N/A";
    const d = devices.find((x) => x.id === id || x.id === (x.device && x.device.id));
    return d ? `${d.brand} ${d.model}` : "Unknown Device";
  };

  const getEmployeeName = (id) => {
    if (!id) return "N/A";
    const e = employees.find((x) => x.id === id || x.id === (x.requested_by && x.requested_by.id));
    return e ? e.full_name : "Unknown User";
  };

  const handleUpdateStatus = async (ticketId, action) => {
    // Map action to backend status value
    let statusValue = null;
    if (action === "approve") statusValue = "in_progress";
    if (action === "reject") statusValue = "rejected";

    if (!statusValue) return;
    try {
      await inventoryAPI.updateTicket(ticketId, { status: statusValue });
      // update local copy
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: statusValue } : t
        )
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update ticket status", err);
    }
  };

  return (
    <div className="ticket-requests-container">
      <h2 className="ticket-heading">Ticket Requests</h2>

      {tickets.length === 0 && (
        <p className="no-request">No ticket requests available.</p>
      )}

      <div className="ticket-grid">
        {tickets.map((ticket) => {
          const statusClass = ticket.status === "in_progress" ? "approved" : ticket.status;
          const displayStatus = statusClass.replace(/_/g, " ");
          return (
            <div key={ticket.id} className="ticket-card">
              <h3 className="ticket-title">
                {ticket.ticket_number || ticket.id} - {ticket.subject || ticket.title}
              </h3>

              <p>
                <strong>User:</strong>{" "}
                {ticket.requested_by_details
                  ? ticket.requested_by_details.full_name
                  : getEmployeeName(ticket.requested_by)}
              </p>

              <p>
                <strong>Device:</strong>{" "}
                {ticket.device_details
                  ? `${ticket.device_details.brand} ${ticket.device_details.model}`
                  : getDeviceName(ticket.device)}
              </p>

              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>

              <p className={`ticket-status status-${statusClass}`}>
                Status: {displayStatus}
              </p>

              <p className="ticket-description">{ticket.description}</p>

              <div className="ticket-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleUpdateStatus(ticket.id, "approve")}
                >
                  Approve
                </button>

                <button
                  className="btn-reject"
                  onClick={() => handleUpdateStatus(ticket.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
