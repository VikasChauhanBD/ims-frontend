import React from "react";
import "./LoadingSpinner.css";
import { AuthScreenSkeleton, SectionSkeleton } from "./SkeletonView";

export default function LoadingSpinner({ fullScreen = false, message = "Loading..." }) {
  if (fullScreen) {
    return <AuthScreenSkeleton message={message} />;
  }

  return (
    <div className="loading-inline">
      <SectionSkeleton title={false} cards={0} lines={2} compact />
      <span className="loading-text">{message}</span>
    </div>
  );
}
