import React from "react";
import "./LoadingGif.css";

export default function LoadingGif({ size = "medium", message = null }) {
  const sizeMap = {
    small: "50px",
    medium: "100px",
    large: "150px",
    xl: "200px",
  };

  return (
    <div className="loading-gif-container">
      <img
        src="/loading.gif"
        alt="Loading"
        className={`loading-gif loading-gif-${size}`}
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
        }}
      />
      {message && <p className="loading-gif-message">{message}</p>}
    </div>
  );
}
