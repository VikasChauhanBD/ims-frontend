import React, { useState } from "react";
import {
  ArrowLeft,
  Filter,
  Headphones,
  Laptop,
  Monitor,
  Package,
  Search,
  Smartphone,
} from "lucide-react";
import UserDeviceCard from "./UserDeviceCard";
import "./UserDevicesView.css";

const CATEGORY_CARDS = [
  {
    key: "all",
    label: "All Inventory",
    description: "See every device currently listed in inventory.",
    icon: Package,
  },
  {
    key: "laptop",
    label: "Laptop",
    description: "Portable work devices for daily office and remote use.",
    icon: Laptop,
  },
  {
    key: "pc",
    label: "PC",
    description: "Desktop systems and PC setups available in inventory.",
    icon: Monitor,
  },
  {
    key: "hdmi_to_lan_connector",
    label: "HDMI to LAN Connector",
    description: "Adapters, dongles, and connector accessories.",
    icon: Package,
  },
  {
    key: "headphones",
    label: "Headphones",
    description: "Headphones and headsets for calls and meetings.",
    icon: Headphones,
  },
  {
    key: "mobile_phones",
    label: "Mobile Phones",
    description: "Company mobile phones for calling and on-the-go access.",
    icon: Smartphone,
  },
];

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getDeviceSearchText = (device = {}) => {
  const specifications = device.specifications || {};
  const specText =
    specifications && typeof specifications === "object"
      ? Object.values(specifications).join(" ")
      : "";

  return [
    device.name,
    device.brand,
    device.model,
    device.device_id,
    device.serial_number,
    device.notes,
    device.device_type,
    specText,
  ]
    .map(normalizeText)
    .join(" ");
};

const matchesCategory = (device, categoryKey) => {
  const deviceType = normalizeText(device?.device_type);
  const searchableText = getDeviceSearchText(device);

  switch (categoryKey) {
    case "laptop":
      return deviceType === "laptop";
    case "pc":
      return deviceType === "pc" || deviceType === "desktop";
    case "hdmi_to_lan_connector":
      return /(hdmi|lan|ethernet|adapter|connector|dongle)/.test(
        searchableText,
      );
    case "headphones":
      return deviceType === "headphone" || deviceType === "headset";
    case "mobile_phones":
      return deviceType === "phone" && !/\bsim\b/.test(searchableText);
    case "all":
    default:
      return true;
  }
};

const formatStatusLabel = (value) =>
  String(value || "unknown").replace(/\b\w/g, (char) => char.toUpperCase());

export default function UserDevicesView({
  devices = [],
  getEmployeeForDevice,
  onAssignDevice,
  onTicketCreated,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const categoryCards = CATEGORY_CARDS.map((category) => {
    const categoryDevices = devices.filter((device) =>
      matchesCategory(device, category.key),
    );
    const availableCount = categoryDevices.filter(
      (device) => device.status === "available",
    ).length;

    return {
      ...category,
      totalCount: categoryDevices.length,
      availableCount,
    };
  });

  const selectedCategory =
    categoryCards.find((category) => category.key === activeCategory) ||
    categoryCards[0];

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = getDeviceSearchText(device).includes(
      normalizeText(searchTerm),
    );

    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    const matchesSelectedCategory = matchesCategory(device, activeCategory);

    return matchesSearch && matchesStatus && matchesSelectedCategory;
  });

  return (
    <div className="user-devices-main-container">
      <div className="user-devices-header">
        <div>
          <h2>Device Inventory</h2>
          <p>Choose a category card to open that inventory in the user view.</p>
        </div>
      </div>

      <div className="user-device-category-grid">
        {categoryCards.map((category) => {
          const Icon = category.icon;
          const isActive = category.key === activeCategory;

          return (
            <button
              key={category.key}
              type="button"
              className={`user-device-category-card ${
                isActive ? "active-category-card" : ""
              }`}
              onClick={() => setActiveCategory(category.key)}
            >
              <div className="user-device-category-top">
                <span className="user-device-category-icon">
                  <Icon />
                </span>
                <span className="user-device-category-count">
                  {category.totalCount}
                </span>
              </div>
              <h3>{category.label}</h3>
              <p>{category.description}</p>
              <span className="user-device-category-meta">
                {category.availableCount} available
              </span>
            </button>
          );
        })}
      </div>

      <div className="user-devices-filters">
        <div className="user-device-search-box">
          <Search className="user-device-search-icon" />
          <input
            type="text"
            placeholder={`Search in ${selectedCategory.label.toLowerCase()}...`}
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
          <button
            type="button"
            className="user-device-reset-btn"
            onClick={() => setActiveCategory("all")}
            disabled={activeCategory === "all"}
          >
            <ArrowLeft className="user-device-reset-icon" />
            All Categories
          </button>
        </div>
      </div>

      <div className="user-device-active-category">
        <div>
          <span className="user-device-active-label">Open Inventory</span>
          <h3>{selectedCategory.label}</h3>
          <p>
            {filteredDevices.length} item
            {filteredDevices.length === 1 ? "" : "s"} match the current view.
          </p>
        </div>
        <span className="user-device-active-status">
          {formatStatusLabel(filterStatus === "all" ? "all statuses" : filterStatus)}
        </span>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="no-user-devices">
          <p>No devices found in this category with the current filters.</p>
        </div>
      ) : (
        <div className="user-devices-grid">
          {filteredDevices.map((device) => {
            const employee = getEmployeeForDevice(device.id);
            return (
              <UserDeviceCard
                key={device.id}
                device={device}
                assignedTo={
                  employee?.full_name || employee?.name || employee?.email
                }
                onAssign={onAssignDevice}
                onTicketCreated={onTicketCreated}
              />
            );
          })}
        </div>
      )}

      <div className="user-devices-footer">
        <p>
          Showing {filteredDevices.length} of {selectedCategory.totalCount}{" "}
          {selectedCategory.label.toLowerCase()} item
          {selectedCategory.totalCount === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
