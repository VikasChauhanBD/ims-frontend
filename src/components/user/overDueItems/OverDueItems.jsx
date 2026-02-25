import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  RotateCcw,
  X,
  AlertCircle,
} from "lucide-react";
import "./OverDueItems.css";

const mockOverdueData = [
  {
    id: "ASSET-001",
    itemName: 'MacBook Pro 16"',
    issueDate: "2025-11-01",
    dueDate: "2026-02-20",
  },
  {
    id: "ASSET-002",
    itemName: "iPhone 14 Pro",
    issueDate: "2025-12-10",
    dueDate: "2026-02-27",
  },
  {
    id: "ASSET-003",
    itemName: 'Dell Monitor 27"',
    issueDate: "2025-10-15",
    dueDate: "2026-01-15",
  },
  {
    id: "ASSET-004",
    itemName: "Logitech MX Keys",
    issueDate: "2026-01-05",
    dueDate: "2026-04-05",
  },
  {
    id: "ASSET-005",
    itemName: 'iPad Pro 12.9"',
    issueDate: "2025-09-20",
    dueDate: "2026-02-24",
  },
];

const getStatus = (dueDateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      label: "Overdue",
      key: "overdue",
      daysLabel: `${Math.abs(diffDays)}d overdue`,
    };
  if (diffDays <= 3)
    return {
      label: "Due Soon",
      key: "due-soon",
      daysLabel: `${diffDays}d left`,
    };
  return { label: "Active", key: "active", daysLabel: `${diffDays}d left` };
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const StatusBadge = ({ status }) => {
  const icons = {
    overdue: <AlertTriangle size={13} />,
    "due-soon": <Clock size={13} />,
    active: <CheckCircle size={13} />,
  };
  return (
    <span className={`od-status-badge od-status-${status.key}`}>
      {icons[status.key]}
      {status.label}
    </span>
  );
};

export default function OverDueItems() {
  const [items, setItems] = useState(mockOverdueData);
  const [confirmItem, setConfirmItem] = useState(null);
  const [returning, setReturning] = useState(false);
  const [filter, setFilter] = useState("all");

  const itemsWithStatus = useMemo(
    () => items.map((item) => ({ ...item, status: getStatus(item.dueDate) })),
    [items],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return itemsWithStatus;
    return itemsWithStatus.filter((i) => i.status.key === filter);
  }, [itemsWithStatus, filter]);

  const counts = useMemo(
    () => ({
      overdue: itemsWithStatus.filter((i) => i.status.key === "overdue").length,
      "due-soon": itemsWithStatus.filter((i) => i.status.key === "due-soon")
        .length,
      active: itemsWithStatus.filter((i) => i.status.key === "active").length,
    }),
    [itemsWithStatus],
  );

  const handleReturnConfirm = async () => {
    setReturning(true);
    await new Promise((r) => setTimeout(r, 800));
    setItems((prev) => prev.filter((i) => i.id !== confirmItem.id));
    setReturning(false);
    setConfirmItem(null);
  };

  return (
    <div className="od-container">
      {/* Header */}
      <div className="od-header">
        <div className="od-header-left">
          <h2 className="od-title">Return Due Items</h2>
          <p className="od-subtitle">Track and manage asset return deadlines</p>
        </div>
        <div className="od-summary-chips">
          <button
            className={`od-chip od-chip-overdue ${filter === "overdue" ? "od-chip-active" : ""}`}
            onClick={() => setFilter(filter === "overdue" ? "all" : "overdue")}
          >
            <AlertTriangle size={14} />
            Overdue <span className="od-chip-count">{counts.overdue}</span>
          </button>
          <button
            className={`od-chip od-chip-due-soon ${filter === "due-soon" ? "od-chip-active" : ""}`}
            onClick={() =>
              setFilter(filter === "due-soon" ? "all" : "due-soon")
            }
          >
            <Clock size={14} />
            Due Soon <span className="od-chip-count">{counts["due-soon"]}</span>
          </button>
          <button
            className={`od-chip od-chip-active-filter ${filter === "active" ? "od-chip-active" : ""}`}
            onClick={() => setFilter(filter === "active" ? "all" : "active")}
          >
            <CheckCircle size={14} />
            Active <span className="od-chip-count">{counts.active}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="od-empty">
          <CheckCircle size={48} className="od-empty-icon" />
          <p>No items in this category</p>
        </div>
      ) : (
        <div className="od-table-wrapper">
          <table className="od-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Item Name</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`od-row od-row-${item.status.key}`}
                >
                  <td>
                    <span className="od-asset-id">{item.id}</span>
                  </td>
                  <td>
                    <span className="od-item-name">{item.itemName}</span>
                  </td>
                  <td>
                    <span className="od-date">
                      {formatDate(item.issueDate)}
                    </span>
                  </td>
                  <td>
                    <div className="od-due-cell">
                      <span className="od-date">
                        {formatDate(item.dueDate)}
                      </span>
                      <span
                        className={`od-days-label od-days-${item.status.key}`}
                      >
                        {item.status.daysLabel}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <button
                      className="od-return-btn"
                      onClick={() => setConfirmItem(item)}
                    >
                      <RotateCcw size={14} />
                      Return Item
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Popup */}
      {confirmItem && (
        <div
          className="od-overlay"
          onClick={() => !returning && setConfirmItem(null)}
        >
          <div className="od-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="od-modal-close"
              onClick={() => !returning && setConfirmItem(null)}
            >
              <X size={18} />
            </button>

            <div
              className={`od-modal-icon-wrap od-modal-icon-${confirmItem.status.key}`}
            >
              <AlertCircle size={32} />
            </div>

            <h3 className="od-modal-title">Confirm Return</h3>
            <p className="od-modal-subtitle">
              You're about to return the following asset:
            </p>

            <div className="od-modal-card">
              <div className="od-modal-row">
                <span className="od-modal-label">Asset ID</span>
                <span className="od-modal-value">{confirmItem.id}</span>
              </div>
              <div className="od-modal-row">
                <span className="od-modal-label">Item</span>
                <span className="od-modal-value">{confirmItem.itemName}</span>
              </div>
              <div className="od-modal-row">
                <span className="od-modal-label">Due Date</span>
                <span className="od-modal-value">
                  {formatDate(confirmItem.dueDate)}
                </span>
              </div>
              <div className="od-modal-row">
                <span className="od-modal-label">Status</span>
                <StatusBadge status={confirmItem.status} />
              </div>
            </div>

            <div className="od-modal-actions">
              <button
                className="od-modal-cancel"
                onClick={() => setConfirmItem(null)}
                disabled={returning}
              >
                Cancel
              </button>
              <button
                className="od-modal-confirm"
                onClick={handleReturnConfirm}
                disabled={returning}
              >
                {returning ? (
                  <>
                    <span className="od-spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RotateCcw size={15} />
                    Confirm Return
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
