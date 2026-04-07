import React, { useState } from "react";
import { Search, Filter, Plus, X } from "lucide-react";
import DeviceCard from "./DeviceCard";
import PopupModal from "../../common/PopupModal";
import { uploadImage, validateImageFile } from "../../../services/imageUpload";
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
    device_type: "laptop",
    brand: "",
    model: "",
    image_url: "",
    serial_number: "",
    purchase_date: "",
    status: "available",
    condition: "excellent",
    notes: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
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

  const handleAddDevice = async () => {
    if (!newDevice.brand || !newDevice.model || !newDevice.serial_number) {
      setPopup({
        open: true,
        title: "Missing Required Fields",
        message: "Please fill required fields: Brand, Model, Serial Number.",
        type: "warning",
      });
      return;
    }

    // Upload image if one is selected
    let deviceData = { ...newDevice };
    if (imageFile) {
      setUploadingImage(true);
      try {
        const validation = validateImageFile(imageFile);
        if (!validation.valid) {
          setPopup({
            open: true,
            title: "Invalid Image",
            message: validation.error,
            type: "error",
          });
          setUploadingImage(false);
          return;
        }

        const imageUrl = await uploadImage(imageFile);
        deviceData.image_url = imageUrl;
      } catch (err) {
        console.error("Failed to upload image:", err);
        setPopup({
          open: true,
          title: "Image Upload Failed",
          message: "Failed to upload image. Device creation cancelled.",
          type: "error",
        });
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    // Auto-generate device_id and name if not provided
    if (!deviceData.device_id) {
      deviceData.device_id = `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    if (!deviceData.name) {
      deviceData.name = `${deviceData.brand} ${deviceData.model}`;
    }

    // Send device to parent; parent will persist and refresh
    if (onAddDevice) onAddDevice(deviceData);

    // Optimistically update local list
    const newDeviceWithId = {
      ...deviceData,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setDeviceList([...deviceList, newDeviceWithId]);

    setShowModal(false);
    setNewDevice({
      device_type: "laptop",
      brand: "",
      model: "",
      image_url: "",
      serial_number: "",
      purchase_date: "",
      status: "available",
      condition: "excellent",
      notes: "",
    });
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL for display purposes only
      const previewURL = URL.createObjectURL(file);
      setNewDevice({ ...newDevice, image_url: previewURL });
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
              <option value="desktop">Desktops</option>
              <option value="pc">PCs</option>
              <option value="monitor">Monitors</option>
              <option value="keyboard">Keyboards</option>
              <option value="mouse">Mice</option>
              <option value="headset">Headsets</option>
              <option value="headphone">Headphones</option>
              <option value="phone">Phones</option>
              <option value="tablet">Tablets</option>
              <option value="cable">Cables</option>
              <option value="charger">Chargers</option>
              <option value="pendrive">Pendrives</option>
              <option value="hard_drive">Hard Drives</option>
              <option value="accessories">Accessories</option>
              <option value="other">Others</option>
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
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="pc">PC</option>
                <option value="monitor">Monitor</option>
                <option value="keyboard">Keyboard</option>
                <option value="mouse">Mouse</option>
                <option value="headset">Headset</option>
                <option value="headphone">Headphone</option>
                <option value="phone">Phone</option>
                <option value="tablet">Tablet</option>
                <option value="cable">Cable</option>
                <option value="charger">Charger</option>
                <option value="pendrive">Pendrive</option>
                <option value="hard_drive">Hard Drive</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
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
                disabled={uploadingImage}
              />

              {newDevice.image_url && (
                <img
                  src={newDevice.image_url}
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
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button 
                className="btn-submit" 
                onClick={handleAddDevice}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading Image..." : "Add Device"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PopupModal
        open={popup.open}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
