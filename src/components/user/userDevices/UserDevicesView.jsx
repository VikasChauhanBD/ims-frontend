import React, { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import UserDeviceCard from "./UserDeviceCard";
import "./UserDevicesView.css";

export default function UserDevicesView({
  devices = [],
  employees = [],
  getEmployeeForDevice,
  onAssignDevice,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serial_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    const matchesType =
      filterType === "all" || device.device_type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="user-devices-main-container">
      <div className="user-devices-header">
        <div>
          <h2>Device Inventory</h2>
          <p>Manage all company devices</p>
        </div>
      </div>

      <div className="user-devices-filters">
        <div className="user-device-search-box">
          <Search className="user-device-search-icon" />
          <input
            type="text"
            placeholder="Search devices by brand, model, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user-device-filter-group">
          <div className="user-device-filter-box">
            <Filter className="user-device-filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div className="user-device-filter-box">
            <Filter className="user-device-filter-icon" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="laptop">Laptops</option>
              <option value="phone">Phones</option>
            </select>
          </div>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="no-devices">
          <p>No devices found matching your criteria</p>
        </div>
      ) : (
        <div className="user-devices-grid">
          {filteredDevices.map((device) => {
            const employee = getEmployeeForDevice(device.id);
            return (
              <UserDeviceCard
                key={device.id}
                device={device}
                assignedTo={employee?.name}
                onAssign={onAssignDevice}
              />
            );
          })}
        </div>
      )}

      <div className="user-devices-footer">
        <p>
          Showing {filteredDevices.length} of {devices.length} devices
        </p>
      </div>
    </div>
  );
}
