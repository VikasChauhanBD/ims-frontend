import React from "react";
import "./StatCard.css";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  subtitle,
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-card-info">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
        <div className={`stat-card-icon ${bgColor} ${color}`}>
          <Icon className="stat-icon" />
        </div>
      </div>
    </div>
  );
}
