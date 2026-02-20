import React, { useState } from "react";
import { Search, Filter, Plus, X } from "lucide-react";
import DeviceCard from "./DeviceCard";
import "./DevicesView.css";

export default function DevicesView({
  devices = [],
  employees = [],
  getEmployeeForDevice,
  onAssignDevice,
  onAddDevice,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [deviceList, setDeviceList] = useState(devices);

  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    device_type: "phone",
    brand: "",
    model: "",
    image: "",
    serial_number: "",
    purchase_date: "",
    status: "available",
    condition: "excellent",
    notes: "",
  });

  const filteredDevices = deviceList.filter((device) => {
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

  const handleAddDevice = () => {
    if (!newDevice.brand || !newDevice.model || !newDevice.serial_number) {
      alert("Please fill required fields: Brand, Model, Serial Number");
      return;
    }

    const newDeviceWithId = {
      ...newDevice,
      id: `d${deviceList.length + 1}`,
      created_at: new Date().toISOString(),
    };
    setDeviceList([...deviceList, newDeviceWithId]);
    if (onAddDevice) onAddDevice(newDeviceWithId);
    setShowModal(false);
    setNewDevice({
      device_type: "phone",
      brand: "",
      model: "",
      image: "",
      serial_number: "",
      purchase_date: "",
      status: "available",
      condition: "excellent",
      notes: "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setNewDevice({ ...newDevice, image: imageURL });
    }
  };

  return (
    <div className="devices-main-container">
      <div className="devices-header">
        <div>
          <h2>Device Inventory</h2>
          <p>Manage all company devices</p>
        </div>
        <button className="device-add-btn" onClick={() => setShowModal(true)}>
          <Plus className="plus-icon" />
          Add Device
        </button>
      </div>

      <div className="devices-filters">
        <div className="device-search-box">
          <Search className="device-search-icon" />
          <input
            type="text"
            placeholder="Search devices by brand, model, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="device-filter-group">
          <div className="device-filter-box">
            <Filter className="device-filter-icon" />
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
          <div className="device-filter-box">
            <Filter className="device-filter-icon" />
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
        <div className="devices-grid">
          {filteredDevices.map((device) => {
            const employee = getEmployeeForDevice(device.id);
            return (
              <DeviceCard
                key={device.id}
                device={device}
                assignedTo={employee?.name}
                onAssign={onAssignDevice}
              />
            );
          })}
        </div>
      )}

      <div className="devices-footer">
        <p>
          Showing {filteredDevices.length} of {deviceList.length} devices
        </p>
      </div>

      {/* ------------------- Add Device Modal ------------------- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Add New Device</h2>
              <X className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <div className="modal-body">
              <label>Device Type</label>
              <select
                value={newDevice.device_type}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, device_type: e.target.value })
                }
              >
                <option value="phone">Phone</option>
                <option value="laptop">Laptop</option>
              </select>

              <label>Brand *</label>
              <input
                type="text"
                value={newDevice.brand}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, brand: e.target.value })
                }
              />

              <label>Model *</label>
              <input
                type="text"
                value={newDevice.model}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, model: e.target.value })
                }
              />

              <label>Serial Number *</label>
              <input
                type="text"
                value={newDevice.serial_number}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, serial_number: e.target.value })
                }
              />

              <label>Purchase Date</label>
              <input
                type="date"
                value={newDevice.purchase_date}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, purchase_date: e.target.value })
                }
              />

              <label>Status</label>
              <select
                value={newDevice.status}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, status: e.target.value })
                }
              >
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>

              <label>Condition</label>
              <select
                value={newDevice.condition}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, condition: e.target.value })
                }
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>

              <label>Notes</label>
              <input
                type="text"
                value={newDevice.notes}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, notes: e.target.value })
                }
              />

              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {newDevice.image && (
                <img
                  src={newDevice.image}
                  alt="Preview"
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    borderRadius: "8px",
                    maxHeight: "150px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn-submit" onClick={handleAddDevice}>
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
