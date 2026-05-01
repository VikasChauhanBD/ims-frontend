const STATUS_MAP = {
  pending: "pending",
  approved: "approved",
  in_progress: "approved",
  on_repair: "on_repair",
  in_repair: "on_repair",
  repairing: "on_repair",
  repairing_initiated: "on_repair",
  repaired: "repaired",
  resolved: "repaired",
  closed: "repaired",
  rejected: "rejected",
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  on_repair: "Repairing Initiated",
  repaired: "Repaired",
  rejected: "Rejected",
};

export const normalizeTicketStatus = (status) =>
  STATUS_MAP[String(status || "").toLowerCase()] || "pending";

export const getTicketStatusLabel = (status) =>
  STATUS_LABELS[normalizeTicketStatus(status)] || "Pending";

export const isTicketClosed = (status) =>
  ["repaired", "rejected"].includes(normalizeTicketStatus(status));
