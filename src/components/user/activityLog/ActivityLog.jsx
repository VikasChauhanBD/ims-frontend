import { useState, useMemo } from "react";
import {
  Activity,
  Laptop,
  RotateCcw,
  Wrench,
  PackageCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronDown,
  TrendingUp,
  Box,
  ArrowDownToLine,
  SendHorizontal,
} from "lucide-react";
import "./ActivityLog.css";

// ── Mock Data ──────────────────────────────────────────────
const MOCK_LOGS = [
  {
    id: "LOG-001",
    actionType: "request_submitted",
    assetName: 'MacBook Pro 16"',
    date: "2025-02-20",
    status: "approved",
  },
  {
    id: "LOG-002",
    actionType: "item_returned",
    assetName: "Logitech MX Mouse",
    date: "2025-02-18",
    status: "completed",
  },
  {
    id: "LOG-003",
    actionType: "repair_ticket",
    assetName: "iPhone 14 Pro",
    date: "2025-02-15",
    status: "in_progress",
  },
  {
    id: "LOG-004",
    actionType: "item_assigned",
    assetName: 'Dell Monitor 27"',
    date: "2025-02-10",
    status: "completed",
  },
  {
    id: "LOG-005",
    actionType: "request_submitted",
    assetName: "Sony WH-1000XM5 Headphones",
    date: "2025-02-08",
    status: "pending",
  },
  {
    id: "LOG-006",
    actionType: "item_returned",
    assetName: "USB-C Hub",
    date: "2025-02-05",
    status: "completed",
  },
  {
    id: "LOG-007",
    actionType: "repair_ticket",
    assetName: 'MacBook Pro 16"',
    date: "2025-01-28",
    status: "resolved",
  },
  {
    id: "LOG-008",
    actionType: "item_assigned",
    assetName: "Mechanical Keyboard",
    date: "2025-01-20",
    status: "completed",
  },
  {
    id: "LOG-009",
    actionType: "request_submitted",
    assetName: "iPad Pro Pencil",
    date: "2025-01-15",
    status: "declined",
  },
  {
    id: "LOG-010",
    actionType: "item_returned",
    assetName: "Portable Monitor",
    date: "2025-01-10",
    status: "completed",
  },
];

// ── Config Maps ────────────────────────────────────────────
const ACTION_CONFIG = {
  request_submitted: {
    label: "Request Submitted",
    icon: SendHorizontal,
    color: "al-type-request",
    dotColor: "#3b82f6",
  },
  item_returned: {
    label: "Item Returned",
    icon: RotateCcw,
    color: "al-type-return",
    dotColor: "#10b981",
  },
  repair_ticket: {
    label: "Repair Ticket Raised",
    icon: Wrench,
    color: "al-type-repair",
    dotColor: "#f59e0b",
  },
  item_assigned: {
    label: "Item Assigned",
    icon: PackageCheck,
    color: "al-type-assigned",
    dotColor: "#8b5cf6",
  },
};

const STATUS_CONFIG = {
  approved: { label: "Approved", cls: "al-s-approved" },
  completed: { label: "Completed", cls: "al-s-completed" },
  in_progress: { label: "In Progress", cls: "al-s-progress" },
  pending: { label: "Pending", cls: "al-s-pending" },
  declined: { label: "Declined", cls: "al-s-declined" },
  resolved: { label: "Resolved", cls: "al-s-resolved" },
};

const FILTERS = [
  { id: "all", label: "All Activity" },
  { id: "request_submitted", label: "Requests" },
  { id: "item_returned", label: "Returns" },
  { id: "item_assigned", label: "Assignments" },
  { id: "repair_ticket", label: "Repair Tickets" },
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatRelative = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

// ── Stat Card ──────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, colorCls }) {
  return (
    <div className={`al-stat-card ${colorCls}`}>
      <div className="al-stat-icon-wrap">
        <Icon size={18} />
      </div>
      <div>
        <div className="al-stat-value">{value}</div>
        <div className="al-stat-label">{label}</div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function ActivityLog({ logs = MOCK_LOGS }) {
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const PREVIEW_COUNT = 5;

  // Stats
  const stats = useMemo(
    () => ({
      requests: logs.filter((l) => l.actionType === "request_submitted").length,
      returned: logs.filter((l) => l.actionType === "item_returned").length,
      assigned: logs.filter((l) => l.actionType === "item_assigned").length,
      repairs: logs.filter((l) => l.actionType === "repair_ticket").length,
    }),
    [logs],
  );

  // Filtered list
  const filtered = useMemo(() => {
    const base =
      filter === "all" ? logs : logs.filter((l) => l.actionType === filter);
    return [...base].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs, filter]);

  const displayed = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);
  const activeFilterLabel = FILTERS.find((f) => f.id === filter)?.label;

  return (
    <div className="al-container">
      {/* ── Section Header ── */}
      <div className="al-header">
        <div className="al-header-left">
          <div className="al-header-icon">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="al-title">Activity Log</h3>
            <p className="al-subtitle">All actions performed on your account</p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="al-filter-wrap">
          <button
            className={`al-filter-btn ${filterOpen ? "al-filter-open" : ""}`}
            onClick={() => setFilterOpen((o) => !o)}
          >
            <Filter size={14} />
            {activeFilterLabel}
            <ChevronDown
              size={13}
              className={`al-filter-chevron ${filterOpen ? "al-chevron-up" : ""}`}
            />
          </button>
          {filterOpen && (
            <div className="al-filter-dropdown">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`al-filter-option ${filter === f.id ? "al-filter-selected" : ""}`}
                  onClick={() => {
                    setFilter(f.id);
                    setFilterOpen(false);
                    setShowAll(false);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="al-stats-row">
        <StatCard
          icon={SendHorizontal}
          label="Requests Submitted"
          value={stats.requests}
          colorCls="al-stat-blue"
        />
        <StatCard
          icon={RotateCcw}
          label="Items Returned"
          value={stats.returned}
          colorCls="al-stat-green"
        />
        <StatCard
          icon={PackageCheck}
          label="Items Assigned"
          value={stats.assigned}
          colorCls="al-stat-purple"
        />
        <StatCard
          icon={Wrench}
          label="Repair Tickets"
          value={stats.repairs}
          colorCls="al-stat-amber"
        />
      </div>

      {/* ── Timeline ── */}
      <div className="al-timeline-wrap">
        <div className="al-timeline-label">
          <TrendingUp size={13} />
          Recent Activity
          <span className="al-timeline-count">{filtered.length}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="al-empty">
            <Activity size={40} className="al-empty-icon" />
            <p>No activity found for this filter.</p>
          </div>
        ) : (
          <div className="al-timeline">
            {displayed.map((log, idx) => {
              const action = ACTION_CONFIG[log.actionType];
              const status = STATUS_CONFIG[log.status];
              const Icon = action?.icon || FileText;
              const isLast = idx === displayed.length - 1;

              return (
                <div
                  key={log.id}
                  className="al-item"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Timeline track */}
                  <div className="al-track">
                    <div
                      className="al-dot"
                      style={{ background: action?.dotColor || "#6b7280" }}
                    >
                      <Icon size={11} color="white" />
                    </div>
                    {!isLast && <div className="al-line" />}
                  </div>

                  {/* Content */}
                  <div className="al-content">
                    <div className="al-content-top">
                      <div className="al-content-left">
                        <span className={`al-action-badge ${action?.color}`}>
                          {action?.label}
                        </span>
                        <span className="al-asset-name">{log.assetName}</span>
                      </div>
                      <div className="al-content-right">
                        <span className={`al-status-pill ${status?.cls}`}>
                          {status?.label}
                        </span>
                        <span className="al-date" title={formatDate(log.date)}>
                          <Clock size={11} />
                          {formatRelative(log.date)}
                        </span>
                      </div>
                    </div>
                    <div className="al-meta">
                      <span className="al-log-id">{log.id}</span>
                      <span className="al-full-date">
                        {formatDate(log.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show more / less */}
            {filtered.length > PREVIEW_COUNT && (
              <button
                className="al-toggle-btn"
                onClick={() => setShowAll((s) => !s)}
              >
                {showAll
                  ? "Show Less"
                  : `View All ${filtered.length} Activities`}
                <ChevronDown
                  size={14}
                  className={showAll ? "al-chevron-up" : ""}
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
