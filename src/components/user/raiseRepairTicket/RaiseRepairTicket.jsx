import { useState, useEffect, useRef } from "react";
import {
  Wrench,
  FileText,
  User,
  Monitor,
  ImageIcon,
  Upload,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ticket,
  Send,
} from "lucide-react";
import { inventoryAPI } from "../../../services/api";
import "./RaiseRepairTicket.css";

const STATUS_LABELS = {
  pending: { label: "Pending", color: "#FFA500" },
  in_progress: { label: "In Progress", color: "#2196F3" },
  resolved: { label: "Resolved", color: "#4CAF50" },
  rejected: { label: "Rejected", color: "#F44336" },
  closed: { label: "Closed", color: "#999" },
};


export default function RaiseRepairTicket({ onTicketCreated }) {
  const [view, setView] = useState("form"); // "form" | "tickets"
  const [myTickets, setMyTickets] = useState([]);

  // Form fields
  const [formData, setFormData] = useState({
    ticket_type: "repair",
    priority: "medium",
    subject: "",
    description: "",
    device: "",
  });
  const [devices, setDevices] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  // Fetch devices and user tickets
  useEffect(() => {
    fetchDevicesAndTickets();
  }, []);

  const fetchDevicesAndTickets = async () => {
    try {
      setLoading(true);
      // Fetch all devices
      const devicesRes = await inventoryAPI.getDevices();
      const devicesList = Array.isArray(devicesRes.data)
        ? devicesRes.data
        : devicesRes.data.results || [];
      setDevices(devicesList);

      // Fetch user's tickets
      const ticketsRes = await inventoryAPI.getMyTickets();
      const ticketsList = Array.isArray(ticketsRes.data)
        ? ticketsRes.data
        : ticketsRes.data.results || [];
      // Filter repair and issue tickets
      const repairTickets = ticketsList.filter((t) =>
        ["repair", "issue", "replacement"].includes(t.ticket_type)
      );
      setMyTickets(repairTickets);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // Create ticket
      const ticketPayload = {
        ticket_type: formData.ticket_type,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description,
        device: formData.device || null,
      };

      await inventoryAPI.createTicket(ticketPayload);
      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          ticket_type: "repair",
          priority: "medium",
          subject: "",
          description: "",
          device: "",
        });
        removeImage();
        // Refresh tickets
        fetchDevicesAndTickets();
        if (onTicketCreated) onTicketCreated();
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to create ticket" });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="rrt-container">
      {/* Header */}
      <div className="rrt-header">
        <div className="rrt-header-left">
          <div className="rrt-title-row">
            <div className="rrt-icon-badge">
              <Wrench size={20} />
            </div>
            <h2 className="rrt-title">Raise Repair Ticket</h2>
          </div>
          <p className="rrt-subtitle">Submit a maintenance request for your device</p>
        </div>

        <div className="rrt-view-toggle">
          <button
            className={`rrt-toggle-btn ${view === "form" ? "rrt-toggle-active" : ""}`}
            onClick={() => setView("form")}
          >
            <Wrench size={14} />
            New Ticket
          </button>
          <button
            className={`rrt-toggle-btn ${view === "tickets" ? "rrt-toggle-active" : ""}`}
            onClick={() => setView("tickets")}
          >
            <Ticket size={14} />
            My Tickets
            {myTickets.length > 0 && (
              <span className="rrt-count">{myTickets.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Form View */}
      {view === "form" && (
        <div className="rrt-form-wrapper">
          {success ? (
            <div className="rrt-success">
              <div className="rrt-success-icon">
                <CheckCircle2 size={52} />
              </div>
              <h3>Ticket Created!</h3>
              <p>Your repair ticket has been submitted successfully. The admin team will review it shortly.</p>
            </div>
          ) : (
            <form className="rrt-form" onSubmit={handleSubmit} noValidate>
              {errors.submit && (
                <div className="rrt-error-banner">
                  <AlertCircle size={14} />
                  {errors.submit}
                </div>
              )}

              {/* Ticket Type & Priority Row */}
              <div className="rrt-form-row">
                <div className="rrt-field">
                  <label className="rrt-label">
                    <Ticket size={13} />
                    Ticket Type <span className="rrt-required">*</span>
                  </label>
                  <select
                    name="ticket_type"
                    value={formData.ticket_type}
                    onChange={handleInputChange}
                    className="rrt-select-input"
                  >
                    <option value="repair">Repair Request</option>
                    <option value="replacement">Replacement Request</option>
                    <option value="issue">Issue Report</option>
                  </select>
                </div>

                <div className="rrt-field">
                  <label className="rrt-label">
                    <AlertCircle size={13} />
                    Priority <span className="rrt-required">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="rrt-select-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Device Selection */}
              <div className="rrt-field">
                <label className="rrt-label">
                  <Monitor size={13} />
                  Device <span className="rrt-optional">(Optional)</span>
                </label>
                <select
                  name="device"
                  value={formData.device}
                  onChange={handleInputChange}
                  className="rrt-select-input"
                >
                  <option value="">Select a device...</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.device_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="rrt-field">
                <label className="rrt-label">
                  <FileText size={13} />
                  Subject <span className="rrt-required">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief title of the issue"
                  className={`rrt-text-input ${errors.subject ? "rrt-error-border" : ""}`}
                />
                {errors.subject && <p className="rrt-error-text">{errors.subject}</p>}
              </div>

              {/* Description */}
              <div className="rrt-field">
                <label className="rrt-label">
                  <FileText size={13} />
                  Description <span className="rrt-required">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className={`rrt-textarea ${errors.description ? "rrt-error-border" : ""}`}
                />
                <div className="rrt-textarea-footer">
                  {errors.description ? (
                    <p className="rrt-error-text">{errors.description}</p>
                  ) : (
                    <span></span>
                  )}
                  <span className="rrt-char-count">{formData.description.length} chars</span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="rrt-field">
                <label className="rrt-label">
                  <ImageIcon size={13} />
                  Image <span className="rrt-optional">(Optional)</span>
                </label>
                {preview ? (
                  <div className="rrt-img-preview">
                    <img src={preview} alt="Preview" />
                    <button
                      type="button"
                      className="rrt-remove-img"
                      onClick={removeImage}
                    >
                      <X size={13} />
                    </button>
                    <span className="rrt-img-name">{image?.name}</span>
                  </div>
                ) : (
                  <div
                    className="rrt-upload-zone"
                    onClick={() => fileRef.current.click()}
                  >
                    <Upload size={22} />
                    <p>Click to upload or drag & drop</p>
                    <p className="rrt-upload-hint">PNG, JPG, WEBP — max 5 MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="rrt-file-hidden"
                  onChange={handleImage}
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="rrt-submit" disabled={submitting || loading}>
                {submitting ? (
                  <>
                    <span className="rrt-spinner" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit Ticket
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tickets View */}
      {view === "tickets" && (
        <div className="rrt-tickets">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              Loading tickets...
            </div>
          ) : myTickets.length === 0 ? (
            <div className="rrt-empty">
              <Ticket size={48} />
              <p>No repair tickets yet</p>
            </div>
          ) : (
            <div className="rrt-list">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="rrt-ticket-card">
                  <div className="rrt-card-header">
                    <div className="rrt-card-title">
                      <span className="rrt-ticket-number">{ticket.ticket_number}</span>
                      <span className="rrt-ticket-subject">{ticket.subject}</span>
                    </div>
                    <span
                      className="rrt-status-badge"
                      style={{
                        backgroundColor:
                          STATUS_LABELS[ticket.status]?.color || "#999",
                      }}
                    >
                      {STATUS_LABELS[ticket.status]?.label || ticket.status}
                    </span>
                  </div>

                  <div className="rrt-card-body">
                    <div className="rrt-meta-row">
                      <span className="rrt-meta-item">
                        <strong>Type:</strong> {ticket.ticket_type}
                      </span>
                      <span className="rrt-meta-item">
                        <strong>Priority:</strong> {ticket.priority}
                      </span>
                      <span className="rrt-meta-item">
                        <strong>Created:</strong>{" "}
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="rrt-description">{ticket.description}</p>

                    {ticket.resolution_notes && (
                      <div className="rrt-resolution">
                        <p>
                          <strong>Resolution:</strong> {ticket.resolution_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
