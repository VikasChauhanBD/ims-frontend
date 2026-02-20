import React from "react";
import {
  Laptop,
  Smartphone,
  Package,
  CheckCircle,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import StatCard from "./StatCard";
import "./Dashboard.css";

export default function Dashboard({ stats }) {
  return (
    <div className="dashboard-main-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <p className="dashboard-subtitle">
          Monitor your inventory and track device assignments
        </p>
      </div>

      <div className="dashboard-stats-grid">
        <StatCard
          title="Total Devices"
          value={stats.totalDevices}
          icon={Package}
          color="text-blue"
          bgColor="bg-blue"
          subtitle={`${stats.totalPhones} Phones, ${stats.totalLaptops} Laptops`}
        />
        <StatCard
          title="Assigned Devices"
          value={stats.assignedDevices}
          icon={CheckCircle}
          color="text-green"
          bgColor="bg-green"
          subtitle={`${Math.round(
            (stats.assignedDevices / stats.totalDevices) * 100
          )}% Utilization`}
        />
        <StatCard
          title="Available Devices"
          value={stats.availableDevices}
          icon={Package}
          color="text-teal"
          bgColor="bg-teal"
          subtitle="Ready to assign"
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          icon={UserCheck}
          color="text-purple"
          bgColor="bg-purple"
          subtitle={`${stats.totalEmployees} Total`}
        />
      </div>

      <div className="distribution-status-grid">
        {/* Device Distribution */}
        <div className="distribution-card">
          <h3 className="distribution-card-title">Device Distribution</h3>
          <div className="distribution-card-content">
            {/* Laptops */}
            <div className="progress-item">
              <div className="progress-header">
                <div className="progress-label">
                  <Laptop className="icon-blue" />
                  <span>Laptops</span>
                </div>
                <span>{stats.totalLaptops}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-blue"
                  style={{
                    width: `${
                      (stats.totalLaptops / stats.totalDevices) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Phones */}
            <div className="progress-item">
              <div className="progress-header">
                <div className="progress-label">
                  <Smartphone className="icon-purple" />
                  <span>Phones</span>
                </div>
                <span>{stats.totalPhones}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-purple"
                  style={{
                    width: `${(stats.totalPhones / stats.totalDevices) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Status */}
        <div className="distribution-card">
          <h3 className="distribution-card-title">Device Status</h3>
          <div className="distribution-card-content">
            {/* Assigned */}
            <div className="progress-item">
              <div className="progress-header">
                <div className="progress-label">
                  <CheckCircle className="icon-green" />
                  <span>Assigned</span>
                </div>
                <span>{stats.assignedDevices}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-green"
                  style={{
                    width: `${
                      (stats.assignedDevices / stats.totalDevices) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Available */}
            <div className="progress-item">
              <div className="progress-header">
                <div className="progress-label">
                  <Package className="icon-teal" />
                  <span>Available</span>
                </div>
                <span>{stats.availableDevices}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-teal"
                  style={{
                    width: `${
                      (stats.availableDevices / stats.totalDevices) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Maintenance */}
            <div className="progress-item">
              <div className="progress-header">
                <div className="progress-label">
                  <AlertTriangle className="icon-yellow" />
                  <span>Maintenance</span>
                </div>
                <span>{stats.maintenanceDevices}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-yellow"
                  style={{
                    width: `${
                      (stats.maintenanceDevices / stats.totalDevices) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
