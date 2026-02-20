import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import AssignmentTable from "./AssignmentTable";
import "./AssignmentsView.css";
import { AssignmentWithDetails } from "../../../assets/data/types";

export default function AssignmentsView({ assignments, onReturnDevice }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.employee?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.device?.brand
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.device?.model
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.device?.serial_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || assignment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeAssignments = assignments.filter(
    (a) => a.status === "active"
  ).length;
  const returnedAssignments = assignments.filter(
    (a) => a.status === "returned"
  ).length;

  return (
    <div className="assignments-main-container">
      <div>
        <h2 className="assignments-title">Device Assignments</h2>
        <p className="assignments-subtitle">
          Track all device assignments and returns
        </p>
      </div>

      <div className="assignments-stats-grid">
        <div className="assignments-stat-card">
          <p className="assignments-stat-label">Total Assignments</p>
          <h3 className="assignments-stat-value total">{assignments.length}</h3>
        </div>
        <div className="assignments-stat-card">
          <p className="assignments-stat-label">Active Assignments</p>
          <h3 className="assignments-stat-value active">{activeAssignments}</h3>
        </div>
        <div className="assignments-stat-card">
          <p className="assignments-stat-label">Returned Devices</p>
          <h3 className="assignments-stat-value returned">
            {returnedAssignments}
          </h3>
        </div>
      </div>

      <div className="assignments-filters">
        <div className="assignments-search-box">
          <Search className="assignments-search-icon" />
          <input
            type="text"
            placeholder="Search by employee name, device brand, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="assignments-filter-dropdown">
          <Filter className="assignments-filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="assignments-filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <AssignmentTable
        assignments={filteredAssignments}
        onReturn={onReturnDevice}
      />

      <div className="assignments-footer">
        <p>
          Showing {filteredAssignments.length} of {assignments.length}{" "}
          assignments
        </p>
      </div>
    </div>
  );
}
