import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
  HelpCircle,
  MessageCircleWarning,
  Monitor,
  ShieldAlert,
  Wrench,
  X,
} from "lucide-react";
import { inventoryAPI } from "../../../services/api";
import {
  getTicketStatusLabel,
  isTicketClosed,
  normalizeTicketStatus,
} from "../../../utils/ticketStatus";
import "./ReportIssue.css";

const ISSUE_TYPES = [
  { id: "software", label: "Software", icon: Code2 },
  { id: "hardware", label: "Hardware", icon: Wrench },
  { id: "damage", label: "Damage", icon: ShieldAlert },
  { id: "other", label: "Other", icon: HelpCircle },
];

const STATUS_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "on_repair", label: "Repairing Initiated" },
  { key: "repaired", label: "Repaired" },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const getStepIndex = (status) => {
  const normalizedStatus = normalizeTicketStatus(status);
  const statusMap = {
    pending: 0,
    approved: 1,
    on_repair: 2,
    repaired: 3,
  };
  return statusMap[normalizedStatus] || 0;
};

export default function ReportIssue({
  onTicketCreated,
  forceOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("report");
  const [devices, setDevices] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const setIssueReports = useCallback((tickets) => {
    setReports(tickets.filter((ticket) => ticket.ticket_type === "issue"));
    setLastSyncedAt(new Date().toISOString());
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const ticketsRes = await inventoryAPI.getMyTickets();
      const allTickets = Array.isArray(ticketsRes.data)
        ? ticketsRes.data
        : ticketsRes.data.results || [];

      setIssueReports(allTickets);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch issue updates");
      console.error("Error refreshing issue reports:", err);
    }
  }, [setIssueReports]);


  // Helper to fetch all device pages
  const fetchAllDevices = async () => {
    let allDevices = [];
    let nextUrl = null;
    let params = { page_size: 100 };
    try {
      do {
        const res = await inventoryAPI.getDevices(nextUrl ? { ...params, page: nextUrl } : params);
        const data = res.data;
        if (Array.isArray(data)) {
          allDevices = allDevices.concat(data);
          break;
        } else {
          allDevices = allDevices.concat(data.results || []);
          nextUrl = data.next ? new URL(data.next, window.location.origin).searchParams.get('page') : null;
        }
      } while (nextUrl);
    } catch (err) {
      throw err;
    }
    return allDevices;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allDevices, ticketsRes] = await Promise.all([
        fetchAllDevices(),
        inventoryAPI.getMyTickets(),
      ]);

      setDevices(allDevices);

      const allTickets = Array.isArray(ticketsRes.data)
        ? ticketsRes.data
        : ticketsRes.data.results || [];
      setIssueReports(allTickets);
    } catch (err) {
      setError(err.message || "Failed to fetch issue data");
      console.error("Error fetching issue widget data:", err);
    } finally {
      setLoading(false);
    }
  }, [setIssueReports]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setView("report");
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!isOpen || view !== "history") return undefined;

    fetchReports();
    const intervalId = window.setInterval(() => {
      fetchReports();
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchReports, isOpen, view]);

  const selectedDeviceObj = devices.find((device) => device.id === selectedDevice);
  const openIssueCount = useMemo(
    () => reports.filter((report) => !isTicketClosed(report.status)).length,
    [reports],
  );

  const validate = () => {
    const nextErrors = {};
    if (!selectedDevice) nextErrors.device = "Select a device first.";
    if (!issueType) nextErrors.issueType = "Choose an issue type.";
    if (!description.trim()) nextErrors.description = "Add a short description.";
    if (description.trim() && description.trim().length < 10) {
      nextErrors.description = "Description must be at least 10 characters.";
    }
    return nextErrors;
  };

  const resetForm = () => {
    setSelectedDevice("");
    setIssueType("");
    setDescription("");
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await inventoryAPI.createTicket({
        ticket_type: "issue",
        priority: "medium",
        subject: issueType,
        description,
        device: selectedDevice,
      });

      setSubmitted(true);
      setView("history");
      resetForm();

      if (onTicketCreated) onTicketCreated();
      await fetchData();

      window.setTimeout(() => {
        setSubmitted(false);
      }, 2200);
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || err.message || "Failed to submit report",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="riw-shell">
      {isOpen && (
        <section className="riw-panel" aria-label="Report issue widget">
          <div className="riw-panel-header">
            <div className="riw-panel-brand">
              <div className="riw-panel-icon">
                <MessageCircleWarning size={18} />
              </div>
              <div>
                <h2 className="riw-panel-title">IT Help Desk</h2>
                <p className="riw-panel-subtitle">Quick issue reporting widget</p>
              </div>
            </div>
            <button
              type="button"
              className="riw-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close issue widget"
            >
              <X size={18} />
            </button>
          </div>

          <div className="riw-tabs">
            <button
              type="button"
              className={`riw-tab ${view === "report" ? "riw-tab-active" : ""}`}
              onClick={() => setView("report")}
            >
              Report Issue
            </button>
            <button
              type="button"
              className={`riw-tab ${view === "history" ? "riw-tab-active" : ""}`}
              onClick={() => {
                setView("history");
                fetchReports();
              }}
            >
              My Reports
              {reports.length > 0 && (
                <span className="riw-tab-badge">{reports.length}</span>
              )}
            </button>
          </div>

          <div className="riw-panel-body">
            {view === "report" && (
              <div className="riw-report-view">
                <div className="riw-chat-bubble riw-chat-bubble-bot">
                  Tell us what happened and we will open a support ticket for your device.
                </div>

                {submitted && (
                  <div className="riw-success-card">
                    <CheckCircle2 size={22} />
                    <div>
                      <strong>Issue reported.</strong>
                      <p>Your ticket was created successfully.</p>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="riw-state">Loading your devices...</div>
                ) : error ? (
                  <div className="riw-state riw-state-error">Error: {error}</div>
                ) : (
                  <form className="riw-form" onSubmit={handleSubmit} noValidate>
                    {errors.submit && (
                      <div className="riw-inline-error">{errors.submit}</div>
                    )}

                    <label className="riw-field">
                      <span className="riw-label">
                        <Monitor size={14} />
                        Device
                      </span>
                      <div className="riw-select-wrap">
                        <select
                          value={selectedDevice}
                          onChange={(event) => {
                            setSelectedDevice(event.target.value);
                            setErrors((prev) => ({ ...prev, device: undefined }));
                          }}
                          className={`riw-select ${errors.device ? "riw-input-error" : ""}`}
                        >
                          <option value="">Choose a device</option>
                          {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                              {device.device_name || device.name} ({device.device_type || "device"})
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="riw-select-icon" />
                      </div>
                      {errors.device && <p className="riw-error-text">{errors.device}</p>}
                    </label>

                    <div className="riw-field">
                      <span className="riw-label">
                        <AlertCircle size={14} />
                        Issue Type
                      </span>
                      <div className="riw-chip-grid">
                        {ISSUE_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              className={`riw-chip ${issueType === type.id ? "riw-chip-active" : ""}`}
                              onClick={() => {
                                setIssueType(type.id);
                                setErrors((prev) => ({ ...prev, issueType: undefined }));
                              }}
                            >
                              <Icon size={15} />
                              {type.label}
                            </button>
                          );
                        })}
                      </div>
                      {errors.issueType && (
                        <p className="riw-error-text">{errors.issueType}</p>
                      )}
                    </div>

                    <label className="riw-field">
                      <span className="riw-label">
                        <FileText size={14} />
                        Description
                      </span>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(event) => {
                          setDescription(event.target.value);
                          setErrors((prev) => ({ ...prev, description: undefined }));
                        }}
                        className={`riw-textarea ${errors.description ? "riw-input-error" : ""}`}
                        placeholder="Example: my screen flickers after waking from sleep..."
                      />
                      <div className="riw-field-footer">
                        {errors.description ? (
                          <p className="riw-error-text">{errors.description}</p>
                        ) : (
                          <span className="riw-hint">
                            {selectedDeviceObj
                              ? `Reporting for ${selectedDeviceObj.device_name || selectedDeviceObj.name}`
                              : "Add enough detail for IT to reproduce the problem."}
                          </span>
                        )}
                        <span className="riw-counter">{description.length}</span>
                      </div>
                    </label>

                    <button
                      type="submit"
                      className="riw-submit"
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : "Create Issue Ticket"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {view === "history" && (
              <div className="riw-history-view">
                <div className="riw-chat-bubble riw-chat-bubble-bot">
                  Track your submitted issue tickets here. Open items stay highlighted until they are repaired or rejected.
                </div>

                {lastSyncedAt && (
                  <p className="riw-sync-note">
                    Last updated: {formatDateTime(lastSyncedAt)}
                  </p>
                )}

                {loading ? (
                  <div className="riw-state">Loading your reports...</div>
                ) : error ? (
                  <div className="riw-state riw-state-error">Error: {error}</div>
                ) : reports.length === 0 ? (
                  <div className="riw-empty">
                    <FileText size={28} />
                    <p>No issues reported yet.</p>
                  </div>
                ) : (
                  <div className="riw-history-list">
                    {reports.map((report) => {
                      const normalizedStatus = normalizeTicketStatus(report.status || "pending");
                      const currentStep = getStepIndex(normalizedStatus);
                      const issueTypeLabel = ISSUE_TYPES.find(
                        (type) => type.id === report.subject?.toLowerCase(),
                      )?.label || report.subject || "Issue";
                      const deviceLabel = report.device_details
                        ? [report.device_details.brand, report.device_details.model, report.device_details.name]
                            .filter(Boolean)
                            .join(" ")
                        : report.device?.device_name || report.device?.name || "Device";

                      return (
                        <article key={report.id} className="riw-history-card">
                          <div className="riw-history-head">
                            <div>
                              <p className="riw-history-ticket">{report.ticket_number}</p>
                              <h3 className="riw-history-device">
                                {deviceLabel}
                              </h3>
                            </div>
                            <span className={`riw-status riw-status-${normalizedStatus}`}>
                              {getTicketStatusLabel(normalizedStatus)}
                            </span>
                          </div>

                          <div className="riw-history-meta">
                            <span className="riw-type-pill">{issueTypeLabel}</span>
                            <span>{formatDate(report.created_at || new Date())}</span>
                          </div>

                          <p className="riw-history-desc">{report.description}</p>

                          <div className="riw-steps">
                            {STATUS_STEPS.map((step, index) => {
                              const done = index < currentStep;
                              const active = index === currentStep;
                              return (
                                <div key={step.key} className="riw-step">
                                  <div className="riw-step-track">
                                    {index < STATUS_STEPS.length - 1 && (
                                      <div
                                        className={`riw-step-line ${
                                          index < currentStep ? "riw-step-line-done" : ""
                                        }`}
                                      />
                                    )}
                                    <div
                                      className={`riw-step-dot ${
                                        done
                                          ? "riw-step-done"
                                          : active
                                            ? "riw-step-active"
                                            : ""
                                      }`}
                                    />
                                  </div>
                                  <span className="riw-step-label">{step.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        className={`riw-trigger ${isOpen ? "riw-trigger-hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open report issue widget"
      >
        <div className="riw-trigger-icon">
          <MessageCircleWarning size={22} />
        </div>
        <div className="riw-trigger-copy">
          <strong>Report Issue</strong>
          <span>Chat with IT support</span>
        </div>
        {openIssueCount > 0 && (
          <span className="riw-trigger-badge">{openIssueCount}</span>
        )}
      </button>
    </div>
  );
}
