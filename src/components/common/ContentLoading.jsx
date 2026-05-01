import React from "react";
import "./ContentLoading.css";

export function IndeterminateLoadBar({ show }) {
  if (!show) return null;
  return (
    <div
      className="indeterminate-load-bar"
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
    />
  );
}

export function ContentLoadingOverlay({ show, message = "Loading…" }) {
  if (!show) return null;
  return (
    <div
      className="content-loading-overlay"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="content-loading-spinner" />
      <p className="content-loading-message">{message}</p>
    </div>
  );
}
