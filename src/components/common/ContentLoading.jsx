import React from "react";
import "./ContentLoading.css";
import { DashboardShellSkeleton } from "./SkeletonView";

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

export function ContentLoadingOverlay({
  show,
  message = "Loading…",
  variant = "default",
}) {
  if (!show) return null;
  return (
    <div
      className="content-loading-overlay"
      aria-busy="true"
      aria-live="polite"
    >
      <DashboardShellSkeleton variant={variant} message={message} />
    </div>
  );
}
