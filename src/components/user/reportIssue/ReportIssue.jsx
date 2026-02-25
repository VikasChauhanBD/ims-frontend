import { useState, useRef } from "react";
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
import "./ReportIssue.css";

const ASSETS = [
  { id: "ASSET-001", name: 'MacBook Pro 16"' },
  { id: "ASSET-002", name: "iPhone 14 Pro" },
  { id: "ASSET-003", name: 'Dell Monitor 27"' },
  { id: "ASSET-004", name: "Logitech MX Keys" },
  { id: "ASSET-005", name: 'iPad Pro 12.9"' },
];

const ISSUE_TYPES = [
  { id: "hardware", label: "Hardware Problem", icon: Wrench },
  { id: "software", label: "Software Problem", icon: Code2 },
  { id: "damage", label: "Physical Damage", icon: ShieldAlert },
  { id: "other", label: "Other", icon: HelpCircle },
];

const STATUS_STEPS = [
  { key: "submitted", label: "Submitted", icon: FileText },
  { key: "under_review", label: "Under Review", icon: Clock },
  { key: "in_repair", label: "In Repair", icon: Hammer },
  { key: "resolved", label: "Resolved", icon: CircleCheck },
];

const MOCK_REPORTS = [
  {
    id: "RPT-001",
    assetId: "ASSET-001",
    assetName: 'MacBook Pro 16"',
    issueType: "hardware",
    issueLabel: "Hardware Problem",
    description: "Keyboard keys are sticking and some are unresponsive.",
    status: "in_repair",
    submittedDate: "2025-02-10",
  },
  {
    id: "RPT-002",
    assetId: "ASSET-003",
    assetName: 'Dell Monitor 27"',
    issueType: "damage",
    issueLabel: "Physical Damage",
    description: "Screen has a crack on the bottom-right corner.",
    status: "under_review",
    submittedDate: "2025-02-18",
  },
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getStepIndex = (status) =>
  STATUS_STEPS.findIndex((s) => s.key === status);

export default function ReportIssue() {
  const [view, setView] = useState("form"); // "form" | "history"
  const [reports, setReports] = useState(MOCK_REPORTS);

  // Form state
  const [selectedAsset, setSelectedAsset] = useState("");
  const [assetOpen, setAssetOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const selectedAssetObj = ASSETS.find((a) => a.id === selectedAsset);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    fileRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!selectedAsset) e.asset = "Please select an asset.";
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
    await new Promise((r) => setTimeout(r, 900));

    const newReport = {
      id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
      assetId: selectedAsset,
      assetName: selectedAssetObj.name,
      issueType,
      issueLabel: ISSUE_TYPES.find((t) => t.id === issueType)?.label,
      description,
      status: "submitted",
      submittedDate: new Date().toISOString().split("T")[0],
    };

    setReports((prev) => [newReport, ...prev]);
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setSelectedAsset("");
      setIssueType("");
      setDescription("");
      removeImage();
    }, 2500);
  };

  return (
    <div className="ri-container">
      {/* Header */}
      <div className="ri-header">
        <div className="ri-header-left">
          <h2 className="ri-title">Report an Issue</h2>
          <p className="ri-subtitle">
            Submit a problem with your assigned asset
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
          ) : (
            <form className="ri-form" onSubmit={handleSubmit} noValidate>
              {/* Select Asset */}
              <div className="ri-field">
                <label className="ri-label">
                  <Monitor size={14} />
                  Select Asset <span className="ri-required">*</span>
                </label>
                <div
                  className={`ri-select ${assetOpen ? "ri-select-open" : ""} ${errors.asset ? "ri-input-error" : ""}`}
                  onClick={() => setAssetOpen((o) => !o)}
                >
                  <span
                    className={
                      selectedAssetObj
                        ? "ri-select-value"
                        : "ri-select-placeholder"
                    }
                  >
                    {selectedAssetObj
                      ? `${selectedAssetObj.id} — ${selectedAssetObj.name}`
                      : "Choose an asset..."}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ri-chevron ${assetOpen ? "ri-chevron-up" : ""}`}
                  />
                </div>
                {assetOpen && (
                  <div className="ri-dropdown">
                    {ASSETS.map((a) => (
                      <div
                        key={a.id}
                        className={`ri-option ${selectedAsset === a.id ? "ri-option-selected" : ""}`}
                        onClick={() => {
                          setSelectedAsset(a.id);
                          setAssetOpen(false);
                          setErrors((e) => ({ ...e, asset: undefined }));
                        }}
                      >
                        <span className="ri-option-id">{a.id}</span>
                        <span className="ri-option-name">{a.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.asset && <p className="ri-error-msg">{errors.asset}</p>}
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
                    onClick={() => fileRef.current.click()}
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
          {reports.length === 0 ? (
            <div className="ri-empty">
              <FileText size={48} className="ri-empty-icon" />
              <p>No reports submitted yet.</p>
            </div>
          ) : (
            <div className="ri-reports-list">
              {reports.map((report) => {
                const currentStep = getStepIndex(report.status);
                const IssueIcon =
                  ISSUE_TYPES.find((t) => t.id === report.issueType)?.icon ||
                  HelpCircle;
                return (
                  <div key={report.id} className="ri-report-card">
                    {/* Card Header */}
                    <div className="ri-report-header">
                      <div className="ri-report-left">
                        <div
                          className={`ri-report-icon-wrap ri-icon-${report.issueType}`}
                        >
                          <IssueIcon size={18} />
                        </div>
                        <div>
                          <div className="ri-report-id">{report.id}</div>
                          <div className="ri-report-asset">
                            {report.assetName}
                          </div>
                        </div>
                      </div>
                      <div className="ri-report-right">
                        <span
                          className={`ri-status-pill ri-status-${report.status}`}
                        >
                          {
                            STATUS_STEPS.find((s) => s.key === report.status)
                              ?.label
                          }
                        </span>
                        <span className="ri-report-date">
                          {formatDate(report.submittedDate)}
                        </span>
                      </div>
                    </div>

                    {/* Issue type + description */}
                    <div className="ri-report-meta">
                      <span className="ri-report-type-badge">
                        {report.issueLabel}
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
