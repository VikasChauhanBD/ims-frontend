import React from "react";
import "./LoadingSpinner.css";

export default function LoadingSpinner({ fullScreen = false, message = "Loading..." }) {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className="spinner-inline"></div>
      <span className="loading-text">{message}</span>
    </div>
  );
}
