import React from "react";
import "./MyTicketsView.css";
import {
  getTicketStatusLabel,
  normalizeTicketStatus,
} from "../../../utils/ticketStatus";

export default function MyTicketsView({ tickets, devices }) {
  const getDeviceName = (ticket) => {
    if (ticket.device_details) {
      return [ticket.device_details.brand, ticket.device_details.model, ticket.device_details.name]
        .filter(Boolean)
        .join(" ");
    }

    const deviceId = ticket.device_id || ticket.device;
    const device = devices.find((d) => d.id === deviceId);
    return device ? [device.brand, device.model, device.name].filter(Boolean).join(" ") : "Unknown Device";
  };

  return (
    <div className="user-tickets-container">
      <h2 className="user-tickets-heading">My Tickets</h2>

      {tickets.length === 0 ? (
        <p className="user-no-tickets">No tickets found.</p>
      ) : (
        <div className="user-tickets-list">
          {tickets.map((ticket) => {
            const normalizedStatus = normalizeTicketStatus(ticket.status);
            return (
            <div key={ticket.id} className="user-ticket-card">
              <h3 className="user-ticket-title">
                {ticket.ticket_number || "Ticket"}{ticket.subject ? ` - ${ticket.subject}` : ""}
              </h3>

              <p>
                <strong>Device:</strong> {getDeviceName(ticket)}
              </p>
              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-${normalizedStatus}`}>
                  {getTicketStatusLabel(ticket.status)}
                </span>
              </p>

              <p className="user-ticket-desc">{ticket.description}</p>

              <div className="user-ticket-footer">
                <span className="user-ticket-date">
                  Created: {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
