import React from "react";
import { Mail, Briefcase, Building2, UserCheck, UserX } from "lucide-react";
import "./EmployeeCard.css";

export default function EmployeeCard({
  employee,
  deviceCount = 0,
  onViewDetails,
}) {
  const statusClasses =
    employee.status === "active"
      ? "employee-status-active"
      : "employee-status-inactive";

  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <div className="employee-info">
          <div className={`employee-icon ${statusClasses}`}>
            {employee.status === "active" ? (
              <UserCheck className="employee-user-icon" />
            ) : (
              <UserX className="employee-user-icon" />
            )}
          </div>
          <div>
            <h3>{employee.name}</h3>
            <p>{employee.position}</p>
          </div>
        </div>
        <span className={`employee-status ${statusClasses}`}>
          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
        </span>
      </div>

      <div className="employee-card-body">
        <div className="employee-detail">
          <Mail className="employee-detail-icon" />
          <span>{employee.email}</span>
        </div>
        <div className="employee-detail">
          <Building2 className="employee-detail-icon" />
          <span>{employee.department}</span>
        </div>
        <div className="employee-detail">
          <Briefcase className="employee-detail-icon" />
          <span>
            {deviceCount} device{deviceCount !== 1 ? "s" : ""} assigned
          </span>
        </div>
      </div>

      {onViewDetails && (
        <button
          className="btn-view-details"
          onClick={() => onViewDetails(employee)}
        >
          View Details
        </button>
      )}
    </div>
  );
}
