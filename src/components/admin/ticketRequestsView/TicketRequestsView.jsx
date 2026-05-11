import React, { useState } from "react";
import "./TicketRequestsView.css";
import { inventoryAPI } from "../../../services/api";
import {
  getTicketStatusLabel,
  normalizeTicketStatus,
} from "../../../utils/ticketStatus";

export default function TicketRequestsView({
  tickets,
  setTickets,
  devices,
  employees,
  onRefresh,
}) {
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

  const getDeviceName = (id) => {
    if (!id) return "N/A";
    const d = devices.find((x) => x.id === id || x.id === (x.device && x.device.id));
    return d ? [d.brand, d.model, d.name].filter(Boolean).join(" ") : "Unknown Device";
  };

  const getEmployeeName = (id) => {
    if (!id) return "N/A";
    const e = employees.find((x) => x.id === id || x.id === (x.requested_by && x.requested_by.id));
    return e ? e.full_name : "Unknown User";
  };

  const handleUpdateStatus = async (ticketId, statusValue) => {
    if (!statusValue) return;
    try {
      setUpdatingTicketId(ticketId);
      await inventoryAPI.updateTicket(ticketId, { status: statusValue });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: normalizeTicketStatus(statusValue) } : t
        )
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update ticket status", err);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleRevokeTicket = async (ticketId) => {
    try {
      setUpdatingTicketId(ticketId);
      await inventoryAPI.revokeTicket(
        ticketId,
        "Ticket revoked by admin.",
      );
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: normalizeTicketStatus("rejected") }
            : t,
        ),
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to revoke ticket", err);
    } finally {
      setUpdatingTicketId(null);
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
          const normalizedStatus = normalizeTicketStatus(ticket.status);
          const displayStatus = getTicketStatusLabel(ticket.status);
          const isUpdating = updatingTicketId === ticket.id;
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
                  ? [ticket.device_details.brand, ticket.device_details.model, ticket.device_details.name]
                      .filter(Boolean)
                      .join(" ")
                  : getDeviceName(ticket.device)}
              </p>

              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>

              <p className={`ticket-status status-${normalizedStatus}`}>
                Status: {displayStatus}
              </p>

              <p className="ticket-description">{ticket.description}</p>

              {normalizedStatus === "pending" && (
                <div className="ticket-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleUpdateStatus(ticket.id, "approved")}
                    disabled={isUpdating}
                  >
                    Approve
                  </button>

                  <button
                    className="btn-reject"
                    onClick={() => handleUpdateStatus(ticket.id, "rejected")}
                    disabled={isUpdating}
                  >
                    Reject
                  </button>
                </div>
              )}

              {normalizedStatus === "approved" && (
                <div className="ticket-actions">
                  <button
                    className="btn-progress"
                    onClick={() => handleUpdateStatus(ticket.id, "on_repair")}
                    disabled={isUpdating}
                  >
                    Start Repair
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRevokeTicket(ticket.id)}
                    disabled={isUpdating}
                  >
                    Revoke Ticket
                  </button>
                </div>
              )}

              {normalizedStatus === "on_repair" && (
                <div className="ticket-actions">
                  <button
                    className="btn-complete"
                    onClick={() => handleUpdateStatus(ticket.id, "repaired")}
                    disabled={isUpdating}
                  >
                    Mark Repaired
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRevokeTicket(ticket.id)}
                    disabled={isUpdating}
                  >
                    Revoke Ticket
                  </button>
                </div>
              )}

              {normalizedStatus === "repaired" && (
                <div className="ticket-actions">
                  <button
                    className="btn-reject"
                    onClick={() => handleRevokeTicket(ticket.id)}
                    disabled={isUpdating}
                  >
                    Revoke Ticket
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
