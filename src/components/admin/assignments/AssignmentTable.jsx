import React from "react";
import { Calendar, User, Package, Clock } from "lucide-react";
import "./AssignmentTable.css";
// import { AssignmentWithDetails } from "../../assets/types";

export default function AssignmentTable({ assignments = [], onReturn }) {
  const calculateDays = (assignedDate, returnedDate) => {
    const start = new Date(assignedDate);
    const end = returnedDate ? new Date(returnedDate) : new Date();
    const days = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const handleReturn = async (assignment) => {
    if (!onReturn || assignment.status === "returned") return;

    const confirmed = window.confirm(
      `Return ${assignment.device?.brand || "this"} ${assignment.device?.model || "device"} and revoke this assignment?`,
    );
    if (!confirmed) return;

    await onReturn(assignment.id);
  };

  if (assignments.length === 0) {
    return (
      <div className="no-assignments-container">
        <Package className="no-assignments-icon" />
        <p className="no-assignments-text">No assignments found</p>
      </div>
    );
  }

  return (
    <div className="assignments-table-container">
      <div className="assignments-table-wrapper">
        <table className="assignments-table">
          <thead className="assignments-table-header">
            <tr>
              <th>Device</th>
              <th>Employee</th>
              <th>Assigned Date</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="assignments-table-row">
                <td>
                  <div className="assignments-device-info">
                    <div className="assignments-device-icon">
                      <Package className="assignments-device-package-icon" />
                    </div>
                    <div>
                      <p className="assignments-device-name">
                        {assignment.device?.brand} {assignment.device?.model}
                      </p>
                      <p className="assignments-device-serial">
                        {assignment.device?.serial_number}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="assignments-employee-info">
                    <User className="assignments-employee-icon" />
                    <div>
                      <p className="assignments-employee-name">
                        {assignment.employee?.full_name}
                      </p>
                      <p className="assignments-employee-department">
                        {assignment.employee?.department}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="assignments-date-info">
                    <Calendar className="assignments-date-icon" />
                    {new Date(assignment.assigned_date).toLocaleDateString()}
                  </div>
                </td>

                <td>
                  <div className="assignments-duration-info">
                    <Clock className="assignments-duration-icon" />
                    {calculateDays(
                      assignment.assigned_date,
                      assignment.return_date,
                    )}{" "}
                    days
                  </div>
                </td>

                <td>
                  <span
                    className={`assignments-status-badge ${
                      assignment.status === "active"
                        ? "assignments-status-active"
                        : "assignments-status-returned"
                    }`}
                  >
                    {assignment.status.charAt(0).toUpperCase() +
                      assignment.status.slice(1)}
                  </span>
                </td>

                <td>
                  {assignment.status === "returned" ? (
                    <button className="assignments-action-btn is-returned" disabled>
                      Returned
                    </button>
                  ) : (
                    <button
                      className="assignments-action-btn"
                      onClick={() => handleReturn(assignment)}
                    >
                      Revoke & Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
