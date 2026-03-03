import { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  ChevronDown,
  Monitor,
  Wrench,
  Code2,
  ShieldAlert,
  HelpCircle,
  Upload,
  X,
  ImageIcon,
  CheckCircle2,
  Clock,
  Hammer,
  CircleCheck,
  FileText,
} from "lucide-react";
import { inventoryAPI } from "../../../services/api";
import "./ReportIssue.css";

const ISSUE_TYPES = [
  { id: "software", label: "Software Problem", icon: Code2 },
  { id: "hardware", label: "Hardware Problem", icon: Wrench },
  { id: "damage", label: "Physical Damage", icon: ShieldAlert },
  { id: "other", label: "Other", icon: HelpCircle },
];

const STATUS_STEPS = [
  { key: "pending", label: "Pending", icon: FileText },
  { key: "in_repair", label: "In Repair", icon: Hammer },
  { key: "resolved", label: "Resolved", icon: CircleCheck },
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getStepIndex = (status) => {
  const statusMap = {
    "pending": 0,
    "in_repair": 1,
    "resolved": 2,
  };
  return statusMap[status] || 0;
};

export default function ReportIssue({ onTicketCreated }) {
  const [view, setView] = useState("form"); // "form" | "history"
  const [devices, setDevices] = useState([]);
  const [reports, setReports] = useState([]);

  // Form state
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  // Fetch devices and user's issues on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch devices
      const devicesRes = await inventoryAPI.getDevices();
      setDevices(Array.isArray(devicesRes.data) ? devicesRes.data : devicesRes.data.results || []);

      // Fetch user's own issues
      const ticketsRes = await inventoryAPI.getMyTickets();
      const allTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.results || [];
      const userIssues = allTickets.filter(t => t.ticket_type === 'issue');
      setReports(userIssues);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDeviceObj = devices.find((d) => d.id === selectedDevice);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!selectedDevice) e.device = "Please select a device.";
    if (!issueType) e.issueType = "Please select an issue type.";
    if (!description.trim()) e.description = "Please describe the issue.";
    else if (description.trim().length < 10)
      e.description = "Description must be at least 10 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // Create ticket with type 'issue'
      const payload = {
        ticket_type: "issue",
        priority: "medium",
        subject: issueType,
        description: description,
        device: selectedDevice,
      };

      await inventoryAPI.createTicket(payload);

      setSubmitting(false);
      setSubmitted(true);

      // Reset form after 2.5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setSelectedDevice("");
        setIssueType("");
        setDescription("");
        removeImage();
        // Refresh the issues list
        if (onTicketCreated) {
          onTicketCreated();
        }
        fetchData();
      }, 2500);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to submit report" });
      setSubmitting(false);
    }
  };

  return (
    <div className="ri-container">
      {/* Header */}
      <div className="ri-header">
        <div className="ri-header-left">
          <h2 className="ri-title">Report an Issue</h2>
          <p className="ri-subtitle">
            Submit a problem with your device
          </p>
        </div>
        <div className="ri-header-tabs">
          <button
            className={`ri-tab-btn ${view === "form" ? "ri-tab-active" : ""}`}
            onClick={() => setView("form")}
          >
            <AlertCircle size={15} />
            New Report
          </button>
          <button
            className={`ri-tab-btn ${view === "history" ? "ri-tab-active" : ""}`}
            onClick={() => setView("history")}
          >
            <FileText size={15} />
            My Reports
            {reports.length > 0 && (
              <span className="ri-badge">{reports.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── FORM VIEW ── */}
      {view === "form" && (
        <div className="ri-form-wrapper">
          {submitted ? (
            <div className="ri-success">
              <div className="ri-success-icon">
                <CheckCircle2 size={48} />
              </div>
              <h3>Report Submitted!</h3>
              <p>
                Your issue has been reported. Our team will review it shortly.
              </p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              Loading devices...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
              Error: {error}
            </div>
          ) : (
            <form className="ri-form" onSubmit={handleSubmit} noValidate>
              {errors.submit && (
                <div style={{ padding: "10px", color: "#d32f2f", marginBottom: "20px" }}>
                  {errors.submit}
                </div>
              )}

              {/* Select Device */}
              <div className="ri-field">
                <label className="ri-label">
                  <Monitor size={14} />
                  Select Device <span className="ri-required">*</span>
                </label>
                <div
                  className={`ri-select ${deviceOpen ? "ri-select-open" : ""} ${errors.device ? "ri-input-error" : ""}`}
                  onClick={() => setDeviceOpen((o) => !o)}
                >
                  <span
                    className={
                      selectedDeviceObj
                        ? "ri-select-value"
                        : "ri-select-placeholder"
                    }
                  >
                    {selectedDeviceObj
                      ? `${selectedDeviceObj.device_name || selectedDeviceObj.name}`
                      : "Choose a device..."}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ri-chevron ${deviceOpen ? "ri-chevron-up" : ""}`}
                  />
                </div>
                {deviceOpen && (
                  <div className="ri-dropdown">
                    {devices.length === 0 ? (
                      <div style={{ padding: "10px", color: "#999" }}>
                        No devices available
                      </div>
                    ) : (
                      devices.map((d) => (
                        <div
                          key={d.id}
                          className={`ri-option ${selectedDevice === d.id ? "ri-option-selected" : ""}`}
                          onClick={() => {
                            setSelectedDevice(d.id);
                            setDeviceOpen(false);
                            setErrors((e) => ({ ...e, device: undefined }));
                          }}
                        >
                          <span className="ri-option-name">
                            {d.device_name || d.name} ({d.device_type || "device"})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {errors.device && <p className="ri-error-msg">{errors.device}</p>}
              </div>

              {/* Issue Type */}
              <div className="ri-field">
                <label className="ri-label">
                  <AlertCircle size={14} />
                  Issue Type <span className="ri-required">*</span>
                </label>
                <div className="ri-issue-grid">
                  {ISSUE_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        className={`ri-issue-card ${issueType === type.id ? "ri-issue-selected" : ""}`}
                        onClick={() => {
                          setIssueType(type.id);
                          setErrors((e) => ({ ...e, issueType: undefined }));
                        }}
                      >
                        <Icon size={20} className="ri-issue-icon" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.issueType && (
                  <p className="ri-error-msg">{errors.issueType}</p>
                )}
              </div>

              {/* Description */}
              <div className="ri-field">
                <label className="ri-label">
                  <FileText size={14} />
                  Description <span className="ri-required">*</span>
                </label>
                <textarea
                  className={`ri-textarea ${errors.description ? "ri-input-error" : ""}`}
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((err) => ({ ...err, description: undefined }));
                  }}
                />
                <div className="ri-textarea-footer">
                  {errors.description ? (
                    <p className="ri-error-msg">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  <span className="ri-char-count">
                    {description.length} chars
                  </span>
                </div>
              </div>

              {/* Upload Image */}
              <div className="ri-field">
                <label className="ri-label">
                  <ImageIcon size={14} />
                  Upload Image <span className="ri-optional">(Optional)</span>
                </label>
                {imagePreview ? (
                  <div className="ri-image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="ri-remove-img"
                      onClick={removeImage}
                    >
                      <X size={14} />
                    </button>
                    <span className="ri-img-name">{image?.name}</span>
                  </div>
                ) : (
                  <div
                    className="ri-upload-zone"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={24} className="ri-upload-icon" />
                    <p className="ri-upload-text">
                      Click to upload or drag & drop
                    </p>
                    <p className="ri-upload-hint">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="ri-file-input"
                  onChange={handleImageChange}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="ri-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="ri-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    Submit Report
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── HISTORY VIEW ── */}
      {view === "history" && (
        <div className="ri-history">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              Loading issues...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
              Error: {error}
            </div>
          ) : reports.length === 0 ? (
            <div className="ri-empty">
              <FileText size={48} className="ri-empty-icon" />
              <p>No issues reported yet.</p>
            </div>
          ) : (
            <div className="ri-reports-list">
              {reports.map((report) => {
                const currentStep = getStepIndex(report.status || "pending");
                const issueTypeLabel = ISSUE_TYPES.find(
                  (t) => t.id === report.subject?.toLowerCase()
                )?.label || report.subject || "Issue";
                const IssueIcon =
                  ISSUE_TYPES.find(
                    (t) => t.id === report.subject?.toLowerCase()
                  )?.icon || AlertCircle;
                return (
                  <div key={report.id} className="ri-report-card">
                    {/* Card Header */}
                    <div className="ri-report-header">
                      <div className="ri-report-left">
                        <div className="ri-report-icon-wrap">
                          <IssueIcon size={18} />
                        </div>
                        <div>
                          <div className="ri-report-id">{report.ticket_number}</div>
                          <div className="ri-report-asset">
                            {report.device?.device_name || report.device?.name || "Device"}
                          </div>
                        </div>
                      </div>
                      <div className="ri-report-right">
                        <span className="ri-status-pill">
                          {report.status || "pending"}
                        </span>
                        <span className="ri-report-date">
                          {formatDate(report.created_at || new Date())}
                        </span>
                      </div>
                    </div>

                    {/* Issue type + description */}
                    <div className="ri-report-meta">
                      <span className="ri-report-type-badge">
                        {issueTypeLabel}
                      </span>
                    </div>
                    <p className="ri-report-desc">{report.description}</p>

                    {/* Status Stepper */}
                    <div className="ri-stepper">
                      {STATUS_STEPS.map((step, idx) => {
                        const StepIcon = step.icon;
                        const done = idx < currentStep;
                        const active = idx === currentStep;
                        return (
                          <div key={step.key} className="ri-step">
                            <div
                              className={`ri-step-circle ${done ? "ri-step-done" : active ? "ri-step-active" : "ri-step-pending"}`}
                            >
                              <StepIcon size={13} />
                            </div>
                            <span
                              className={`ri-step-label ${active ? "ri-step-label-active" : done ? "ri-step-label-done" : ""}`}
                            >
                              {step.label}
                            </span>
                            {idx < STATUS_STEPS.length - 1 && (
                              <div
                                className={`ri-step-line ${done ? "ri-line-done" : ""}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
