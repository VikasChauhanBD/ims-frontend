import React from "react";
import "./TicketRequestsView.css";

export default function TicketRequestsView({
  tickets,
  setTickets,
  devices,
  employees,
}) {
  const getDeviceName = (id) => {
    const d = devices.find((x) => x.id === id);
    return d ? `${d.brand} ${d.model}` : "Unknown Device";
  };

  const getEmployeeName = (id) => {
    const e = employees.find((x) => x.id === id);
    return e ? e.full_name : "Unknown User";
  };

  const updateStatus = (id, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="ticket-requests-container">
      <h2 className="ticket-heading">Ticket Requests</h2>

      {tickets.length === 0 && (
        <p className="no-request">No ticket requests available.</p>
      )}

      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <h3 className="ticket-title">{ticket.title}</h3>

            <p>
              <strong>User:</strong> {getEmployeeName(ticket.employee_id)}
            </p>
            <p>
              <strong>Device:</strong> {getDeviceName(ticket.device_id)}
            </p>
            <p>
              <strong>Priority:</strong> {ticket.priority}
            </p>

            <p className={`ticket-status status-${ticket.status}`}>
              Status: {ticket.status}
            </p>

            <p className="ticket-description">{ticket.description}</p>

            <div className="ticket-actions">
              <button
                className="btn-approve"
                onClick={() => updateStatus(ticket.id, "approved")}
              >
                Approve
              </button>

              <button
                className="btn-reject"
                onClick={() => updateStatus(ticket.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
