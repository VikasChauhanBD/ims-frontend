import { useState, useRef } from "react";
import {
  Wrench,
  FileText,
  Hash,
  User,
  Monitor,
  ImageIcon,
  Upload,
  X,
  CheckCircle2,
  Clock,
  Hammer,
  CircleCheck,
  ChevronDown,
  MessageSquare,
  Ticket,
} from "lucide-react";
import "./RaiseRepairTicket.css";

// ── Mock Data ──────────────────────────────────────────────
const ASSETS = [
  { id: "ASSET-001", name: 'MacBook Pro 16"' },
  { id: "ASSET-002", name: "iPhone 14 Pro" },
  { id: "ASSET-003", name: 'Dell Monitor 27"' },
  { id: "ASSET-004", name: "Logitech MX Keys" },
  { id: "ASSET-005", name: 'iPad Pro 12.9"' },
];

const CURRENT_EMPLOYEE = { id: "EMP-2024-001", name: "Sarah Mitchell" };

const STATUS_STEPS = [
  { key: "submitted", label: "Submitted", icon: FileText },
  { key: "under_review", label: "Under Review", icon: Clock },
  { key: "in_repair", label: "In Repair", icon: Hammer },
  { key: "resolved", label: "Resolved", icon: CircleCheck },
];

const MOCK_TICKETS = [
  {
    ticketId: "TKT-2025-001",
    assetId: "ASSET-001",
    assetName: 'MacBook Pro 16"',
    employeeId: "EMP-2024-001",
    description:
      "Keyboard keys are sticking and some are completely unresponsive after liquid spill.",
    status: "in_repair",
    adminRemark: "Device received. Keyboard replacement in progress.",
    createdAt: "2025-02-10",
  },
  {
    ticketId: "TKT-2025-002",
    assetId: "ASSET-003",
    assetName: 'Dell Monitor 27"',
    employeeId: "EMP-2024-001",
    description:
      "Screen has a large crack on the bottom-right corner affecting visibility.",
    status: "under_review",
    adminRemark: "",
    createdAt: "2025-02-18",
  },
];

// ── Helpers ────────────────────────────────────────────────
let ticketCounter = 3;
const genTicketId = () =>
  `TKT-2025-${String(ticketCounter++).padStart(3, "0")}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getStepIndex = (status) =>
  STATUS_STEPS.findIndex((s) => s.key === status);

// ── Sub-components ─────────────────────────────────────────
function StatusStepper({ status }) {
  const current = getStepIndex(status);
  return (
    <div className="rrt-stepper">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={step.key} className="rrt-step">
            <div
              className={`rrt-step-circle ${done ? "rrt-step-done" : active ? "rrt-step-active" : "rrt-step-pending"}`}
            >
              <Icon size={12} />
            </div>
            <span
              className={`rrt-step-label ${active ? "rrt-label-active" : done ? "rrt-label-done" : ""}`}
            >
              {step.label}
            </span>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`rrt-step-line ${done ? "rrt-line-done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    submitted: { label: "Submitted", cls: "rrt-pill-submitted" },
    under_review: { label: "Under Review", cls: "rrt-pill-review" },
    in_repair: { label: "In Repair", cls: "rrt-pill-repair" },
    resolved: { label: "Resolved", cls: "rrt-pill-resolved" },
  };
  const { label, cls } = map[status] || { label: status, cls: "" };
  return <span className={`rrt-status-pill ${cls}`}>{label}</span>;
}

// ── Main Component ─────────────────────────────────────────
export default function RaiseRepairTicket() {
  const [view, setView] = useState("form"); // "form" | "tickets"
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  // form fields
  const [assetId, setAssetId] = useState("");
  const [assetOpen, setAssetOpen] = useState(false);
  const [description, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const selectedAsset = ASSETS.find((a) => a.id === assetId);

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
    const e = {};
    if (!assetId) e.asset = "Please select an asset.";
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

    const newTicket = {
      ticketId: genTicketId(),
      assetId,
      assetName: selectedAsset.name,
      employeeId: CURRENT_EMPLOYEE.id,
      description: description.trim(),
      status: "submitted",
      adminRemark: "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setAssetId("");
      setDesc("");
      removeImage();
    }, 2600);
  };

  return (
    <div className="rrt-container">
      {/* ── Header ── */}
      <div className="rrt-header">
        <div className="rrt-header-left">
          <div className="rrt-title-row">
            <div className="rrt-icon-badge">
              <Wrench size={20} />
            </div>
            <h2 className="rrt-title">Raise Repair Ticket</h2>
          </div>
          <p className="rrt-subtitle">
            Submit a structured maintenance request for your asset
          </p>
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
            {tickets.length > 0 && (
              <span className="rrt-count">{tickets.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ══ FORM VIEW ══ */}
      {view === "form" && (
        <div className="rrt-form-wrapper">
          {success ? (
            <div className="rrt-success">
              <div className="rrt-success-icon">
                <CheckCircle2 size={52} />
              </div>
              <h3>Ticket Raised!</h3>
              <p>
                Your repair ticket has been submitted. Our team will review it
                shortly.
              </p>
            </div>
          ) : (
            <form className="rrt-form" onSubmit={handleSubmit} noValidate>
              {/* Auto-generated fields row */}
              <div className="rrt-auto-row">
                <div className="rrt-auto-field">
                  <div className="rrt-auto-label">
                    <Hash size={13} /> Ticket ID
                  </div>
                  <div className="rrt-auto-value">Auto-generated on submit</div>
                </div>
                <div className="rrt-auto-field">
                  <div className="rrt-auto-label">
                    <User size={13} /> Employee ID
                  </div>
                  <div className="rrt-auto-value rrt-auto-filled">
                    {CURRENT_EMPLOYEE.id} — {CURRENT_EMPLOYEE.name}
                  </div>
                </div>
              </div>

              {/* Select Asset */}
              <div className="rrt-field">
                <label className="rrt-label">
                  <Monitor size={13} />
                  Asset ID <span className="rrt-required">*</span>
                </label>
                <div
                  className={`rrt-select ${assetOpen ? "rrt-select-open" : ""} ${errors.asset ? "rrt-error-border" : ""}`}
                  onClick={() => setAssetOpen((o) => !o)}
                >
                  <span
                    className={
                      selectedAsset ? "rrt-select-val" : "rrt-select-ph"
                    }
                  >
                    {selectedAsset
                      ? `${selectedAsset.id} — ${selectedAsset.name}`
                      : "Select an asset..."}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`rrt-chevron ${assetOpen ? "rrt-chevron-up" : ""}`}
                  />
                </div>
                {assetOpen && (
                  <div className="rrt-dropdown">
                    {ASSETS.map((a) => (
                      <div
                        key={a.id}
                        className={`rrt-option ${assetId === a.id ? "rrt-option-sel" : ""}`}
                        onClick={() => {
                          setAssetId(a.id);
                          setAssetOpen(false);
                          setErrors((err) => ({ ...err, asset: undefined }));
                        }}
                      >
                        <span className="rrt-opt-id">{a.id}</span>
                        <span className="rrt-opt-name">{a.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.asset && <p className="rrt-err">{errors.asset}</p>}
              </div>

              {/* Description */}
              <div className="rrt-field">
                <label className="rrt-label">
                  <FileText size={13} />
                  Description <span className="rrt-required">*</span>
                </label>
                <textarea
                  className={`rrt-textarea ${errors.description ? "rrt-error-border" : ""}`}
                  rows={4}
                  placeholder="Describe the issue in detail — what's broken, when it started, any error messages..."
                  value={description}
                  onChange={(e) => {
                    setDesc(e.target.value);
                    setErrors((err) => ({ ...err, description: undefined }));
                  }}
                />
                <div className="rrt-textarea-footer">
                  {errors.description ? (
                    <p className="rrt-err">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  <span className="rrt-char">{description.length} chars</span>
                </div>
              </div>

              {/* Upload Image */}
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
                    <Upload size={22} className="rrt-upload-icon" />
                    <p className="rrt-upload-text">
                      Click to upload or drag & drop
                    </p>
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

              {/* Admin Remarks — read-only info block */}
              <div className="rrt-field">
                <label className="rrt-label">
                  <MessageSquare size={13} />
                  Admin Remarks
                </label>
                <div className="rrt-remarks-placeholder">
                  Admin remarks will appear here after review.
                </div>
              </div>

              <button
                type="submit"
                className="rrt-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="rrt-spinner" /> Submitting...
                  </>
                ) : (
                  <>
                    <Wrench size={15} /> Raise Ticket
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ══ TICKETS VIEW ══ */}
      {view === "tickets" && (
        <div className="rrt-tickets">
          {tickets.length === 0 ? (
            <div className="rrt-empty">
              <Ticket size={48} className="rrt-empty-icon" />
              <p>No repair tickets raised yet.</p>
            </div>
          ) : (
            <div className="rrt-list">
              {tickets.map((t) => (
                <div key={t.ticketId} className="rrt-card">
                  {/* Card top bar */}
                  <div className="rrt-card-header">
                    <div className="rrt-card-left">
                      <span className="rrt-ticket-id">{t.ticketId}</span>
                      <span className="rrt-card-date">
                        {formatDate(t.createdAt)}
                      </span>
                    </div>
                    <StatusPill status={t.status} />
                  </div>

                  {/* Meta row */}
                  <div className="rrt-meta-row">
                    <div className="rrt-meta-item">
                      <span className="rrt-meta-label">Asset</span>
                      <span className="rrt-meta-val">
                        {t.assetId} — {t.assetName}
                      </span>
                    </div>
                    <div className="rrt-meta-item">
                      <span className="rrt-meta-label">Employee</span>
                      <span className="rrt-meta-val">{t.employeeId}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="rrt-card-desc">{t.description}</p>

                  {/* Admin Remark */}
                  {t.adminRemark ? (
                    <div className="rrt-admin-remark">
                      <MessageSquare size={13} className="rrt-remark-icon" />
                      <div>
                        <span className="rrt-remark-label">Admin Remark</span>
                        <p className="rrt-remark-text">{t.adminRemark}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rrt-no-remark">
                      <MessageSquare size={13} />
                      No admin remarks yet
                    </div>
                  )}

                  {/* Stepper */}
                  <StatusStepper status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
