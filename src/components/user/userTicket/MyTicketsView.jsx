import React from "react";
import "./MyTicketsView.css";

export default function MyTicketsView({ tickets, devices }) {
  const getDeviceName = (deviceId) => {
    const device = devices.find((d) => d.id === deviceId);
    return device ? `${device.brand} ${device.model}` : "Unknown Device";
  };

  return (
    <div className="user-tickets-container">
      <h2 className="user-tickets-heading">My Tickets</h2>

      {tickets.length === 0 ? (
        <p className="user-no-tickets">No tickets found.</p>
      ) : (
        <div className="user-tickets-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="user-ticket-card">
              <h3 className="user-ticket-title">{ticket.title}</h3>

              <p>
                <strong>Device:</strong> {getDeviceName(ticket.device_id)}
              </p>
              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-${ticket.status}`}>
                  {ticket.status}
                </span>
              </p>

              <p className="user-ticket-desc">{ticket.description}</p>

              <div className="user-ticket-footer">
                <span className="user-ticket-date">
                  Created: {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
