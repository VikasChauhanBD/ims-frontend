import React from "react";
import { Mail, Briefcase, Building2, UserCheck, UserX } from "lucide-react";
import "./EmployeeCard.css";

export default function EmployeeCard({
  employee,
  deviceCount = 0,
  onViewDetails,
}) {
  // Use is_active boolean from API
  const isActive = employee.is_active === true;
  const statusClasses = isActive
    ? "employee-status-active"
    : "employee-status-inactive";

  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <div className="employee-info">
          <div className={`employee-icon ${statusClasses}`}>
            {isActive ? (
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
          {isActive ? "Active" : "Inactive"}
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
    </div>
  );
}
