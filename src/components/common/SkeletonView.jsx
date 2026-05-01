import React from "react";
import "./SkeletonView.css";

export function SkeletonBlock({ className = "", style }) {
  return <div className={`skeleton-block ${className}`.trim()} style={style} />;
}

export function AuthScreenSkeleton({ message = "Loading..." }) {
  return (
    <div className="skeleton-auth-shell" aria-busy="true" aria-live="polite">
      <div className="skeleton-auth-card">
        <div className="skeleton-auth-header">
          <SkeletonBlock className="skeleton-auth-logo" />
          <SkeletonBlock className="skeleton-auth-title" />
          <SkeletonBlock className="skeleton-auth-subtitle" />
        </div>
        <div className="skeleton-auth-form">
          <SkeletonBlock className="skeleton-input-label" />
          <SkeletonBlock className="skeleton-input" />
          <SkeletonBlock className="skeleton-input-label" />
          <SkeletonBlock className="skeleton-input" />
          <SkeletonBlock className="skeleton-button" />
        </div>
        <p className="skeleton-loading-copy">{message}</p>
      </div>
    </div>
  );
}

export function SectionSkeleton({
  title = true,
  lines = 3,
  cards = 3,
  compact = false,
}) {
  return (
    <div className={`section-skeleton ${compact ? "section-skeleton-compact" : ""}`}>
      {title && (
        <div className="section-skeleton-header">
          <SkeletonBlock className="section-skeleton-title" />
          <SkeletonBlock className="section-skeleton-subtitle" />
        </div>
      )}
      {cards > 0 && (
        <div className="section-skeleton-grid">
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="section-skeleton-card">
              <SkeletonBlock className="section-skeleton-card-title" />
              <SkeletonBlock className="section-skeleton-card-line" />
              <SkeletonBlock className="section-skeleton-card-line short" />
            </div>
          ))}
        </div>
      )}
      {lines > 0 && (
        <div className="section-skeleton-list">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="section-skeleton-row">
              <SkeletonBlock className="section-skeleton-avatar" />
              <div className="section-skeleton-row-copy">
                <SkeletonBlock className="section-skeleton-line" />
                <SkeletonBlock className="section-skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardShellSkeleton({ variant = "default", message }) {
  const cardCount = variant === "dashboard" ? 4 : 3;

  return (
    <div className="dashboard-shell-skeleton" aria-busy="true" aria-live="polite">
      <div className="dashboard-shell-header">
        <SkeletonBlock className="dashboard-shell-title" />
        <SkeletonBlock className="dashboard-shell-subtitle" />
      </div>
      <div className="dashboard-shell-toolbar">
        <SkeletonBlock className="dashboard-shell-filter wide" />
        <SkeletonBlock className="dashboard-shell-filter" />
        <SkeletonBlock className="dashboard-shell-filter" />
      </div>
      <div className="dashboard-shell-grid">
        {Array.from({ length: cardCount }).map((_, index) => (
          <div key={index} className="dashboard-shell-card">
            <SkeletonBlock className="dashboard-shell-card-title" />
            <SkeletonBlock className="dashboard-shell-card-value" />
            <SkeletonBlock className="dashboard-shell-card-line" />
          </div>
        ))}
      </div>
      <div className="dashboard-shell-panels">
        <div className="dashboard-shell-panel">
          <SkeletonBlock className="dashboard-shell-panel-title" />
          <SkeletonBlock className="dashboard-shell-panel-line" />
          <SkeletonBlock className="dashboard-shell-panel-line" />
          <SkeletonBlock className="dashboard-shell-panel-line short" />
        </div>
        <div className="dashboard-shell-panel">
          <SkeletonBlock className="dashboard-shell-panel-title" />
          <SkeletonBlock className="dashboard-shell-panel-line" />
          <SkeletonBlock className="dashboard-shell-panel-line" />
          <SkeletonBlock className="dashboard-shell-panel-line short" />
        </div>
      </div>
      {message && <p className="skeleton-loading-copy">{message}</p>}
    </div>
  );
}
