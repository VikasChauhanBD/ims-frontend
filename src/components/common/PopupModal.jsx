import React from "react";
import "./PopupModal.css";

const PopupModal = ({ open, title, message, type = "info", actions = [], onClose }) => {
  if (!open) return null;

  return (
    <div className="popup-modal-overlay" onClick={onClose}>
      <div className="popup-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={`popup-modal-header popup-modal-${type}`}>
          <h3>{title}</h3>
        </div>
        <div className="popup-modal-body">
          <p>{message}</p>
        </div>
        <div className="popup-modal-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`popup-modal-button ${action.variant || "primary"}`}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          ))}
          {!actions.length && (
            <button
              className="popup-modal-button primary"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
