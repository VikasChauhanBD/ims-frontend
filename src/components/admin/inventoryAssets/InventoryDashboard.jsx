// InventoryDashboard.jsx
import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  Laptop,
  Smartphone,
  Headphones,
  Cable,
  Monitor,
  Search,
  Bell,
  Download,
  Mail,
  Edit2,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Users,
  Send,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import "./InventoryDashboard2.css";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ASSETS = [
  {
    id: 1,
    asset_name: "Dell XPS 15",
    category: "laptop",
    serial_number: "SN-LPT-001",
    assigned_person_name: "Arjun Mehta",
    assigned_email: "arjun@delisas.com",
    assigned_date: "2024-01-15",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
  {
    id: 2,
    asset_name: 'MacBook Pro 14"',
    category: "laptop",
    serial_number: "SN-LPT-002",
    assigned_person_name: "Priya Sharma",
    assigned_email: "priya@delisas.com",
    assigned_date: "2024-02-10",
    claimed: false,
    pending_claim: true,
    mail_sent: true,
    status: "pending_claim",
  },
  {
    id: 3,
    asset_name: "HP EliteDesk 800",
    category: "pc",
    serial_number: "SN-PC-001",
    assigned_person_name: "Rahul Singh",
    assigned_email: "rahul@delisas.com",
    assigned_date: "2024-01-20",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
  {
    id: 4,
    asset_name: "Lenovo ThinkCentre",
    category: "pc",
    serial_number: "SN-PC-002",
    assigned_person_name: "Sneha Patel",
    assigned_email: "",
    assigned_date: "2024-03-05",
    claimed: false,
    pending_claim: false,
    mail_sent: false,
    status: "assigned",
  },
  {
    id: 5,
    asset_name: "Samsung Galaxy S24",
    category: "mobile",
    serial_number: "SN-MOB-001",
    assigned_person_name: "Karan Joshi",
    assigned_email: "karan@delisas.com",
    assigned_date: "2024-02-28",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
  {
    id: 6,
    asset_name: "iPhone 15 Pro",
    category: "mobile",
    serial_number: "SN-MOB-002",
    assigned_person_name: "Meera Nair",
    assigned_email: "meera@delisas.com",
    assigned_date: "2024-03-12",
    claimed: false,
    pending_claim: true,
    mail_sent: true,
    status: "pending_claim",
  },
  {
    id: 7,
    asset_name: "Sony WH-1000XM5",
    category: "headphone",
    serial_number: "SN-HP-001",
    assigned_person_name: "Vikram Rao",
    assigned_email: "vikram@delisas.com",
    assigned_date: "2024-01-30",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
  {
    id: 8,
    asset_name: "Bose QC45",
    category: "headphone",
    serial_number: "SN-HP-002",
    assigned_person_name: "Divya Kumar",
    assigned_email: "",
    assigned_date: "2024-03-20",
    claimed: false,
    pending_claim: false,
    mail_sent: false,
    status: "assigned",
  },
  {
    id: 9,
    asset_name: "USB-C Hub Pro",
    category: "connector",
    serial_number: "SN-CON-001",
    assigned_person_name: "Amit Gupta",
    assigned_email: "amit@delisas.com",
    assigned_date: "2024-02-14",
    claimed: false,
    pending_claim: true,
    mail_sent: false,
    status: "pending_claim",
  },
  {
    id: 10,
    asset_name: "Thunderbolt 4 Dock",
    category: "connector",
    serial_number: "SN-CON-002",
    assigned_person_name: "Pooja Iyer",
    assigned_email: "pooja@delisas.com",
    assigned_date: "2024-03-01",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
  {
    id: 11,
    asset_name: "ASUS ZenBook 14",
    category: "laptop",
    serial_number: "SN-LPT-003",
    assigned_person_name: "Rohan Das",
    assigned_email: "rohan@delisas.com",
    assigned_date: "2024-03-15",
    claimed: false,
    pending_claim: false,
    mail_sent: false,
    status: "assigned",
  },
  {
    id: 12,
    asset_name: "Dell OptiPlex 7090",
    category: "pc",
    serial_number: "SN-PC-003",
    assigned_person_name: "Ananya Roy",
    assigned_email: "ananya@delisas.com",
    assigned_date: "2024-01-25",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
  {
    id: 13,
    asset_name: "OnePlus 12",
    category: "mobile",
    serial_number: "SN-MOB-003",
    assigned_person_name: "Suresh Babu",
    assigned_email: "",
    assigned_date: "2024-02-20",
    claimed: false,
    pending_claim: false,
    mail_sent: false,
    status: "assigned",
  },
  {
    id: 14,
    asset_name: "JBL Tune 760NC",
    category: "headphone",
    serial_number: "SN-HP-003",
    assigned_person_name: "Kavya Menon",
    assigned_email: "kavya@delisas.com",
    assigned_date: "2024-03-08",
    claimed: false,
    pending_claim: true,
    mail_sent: true,
    status: "pending_claim",
  },
  {
    id: 15,
    asset_name: "HDMI 2.1 Adapter",
    category: "connector",
    serial_number: "SN-CON-003",
    assigned_person_name: "Deepak Nath",
    assigned_email: "deepak@delisas.com",
    assigned_date: "2024-02-05",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
  {
    id: 16,
    asset_name: "Lenovo IdeaPad 5",
    category: "laptop",
    serial_number: "SN-LPT-004",
    assigned_person_name: "Ritu Verma",
    assigned_email: "ritu@delisas.com",
    assigned_date: "2024-01-10",
    claimed: true,
    pending_claim: false,
    mail_sent: true,
    status: "claimed",
  },
];

const CATEGORY_META = {
  all: { label: "All Assets", icon: LayoutDashboard, color: "#2563eb" },
  laptop: { label: "Laptops", icon: Laptop, color: "#7c3aed" },
  pc: { label: "PCs / Desktops", icon: Monitor, color: "#0891b2" },
  mobile: { label: "Mobile Devices", icon: Smartphone, color: "#d97706" },
  headphone: { label: "Headphones", icon: Headphones, color: "#059669" },
  connector: { label: "Connectors", icon: Cable, color: "#db2777" },
};

const ITEMS_PER_PAGE = 6;

// ── Mini bar chart component ─────────────────────────────────────────────────
const MiniBar = ({ data, color }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="id-minibar">
      {data.map((d, i) => (
        <div key={i} className="id-minibar-col">
          <div
            className="id-minibar-fill"
            style={{ height: `${(d.value / max) * 100}%`, background: color }}
          />
          <span className="id-minibar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const InventoryDashboard = ({
  assets = [],
  onSendMail,
  onUpdateEmail,
  loading,
}) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [sendingId, setSendingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // Per-category counts for sidebar badges
  const categoryCounts = useMemo(() => {
    const counts = {};
    Object.keys(CATEGORY_META).forEach((k) => {
      counts[k] =
        k === "all"
          ? assets.length
          : assets.filter((a) => a.category === k).length;
    });
    return counts;
  }, [assets]);

  // Filtered assets for selected category
  const categoryAssets = useMemo(() => {
    return activeCategory === "all"
      ? assets
      : assets.filter((a) => a.category === activeCategory);
  }, [assets, activeCategory]);

  // Further filtered for table
  const filteredAssets = useMemo(() => {
    setPage(1);
    return categoryAssets.filter((asset) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        asset.asset_name.toLowerCase().includes(s) ||
        asset.serial_number.toLowerCase().includes(s) ||
        asset.assigned_person_name.toLowerCase().includes(s) ||
        (asset.assigned_email &&
          asset.assigned_email.toLowerCase().includes(s));
      const matchStatus =
        filterStatus === "all" ||
        asset.status === filterStatus ||
        (filterStatus === "claimed" && asset.claimed) ||
        (filterStatus === "pending" && asset.pending_claim) ||
        (filterStatus === "unclaimed" &&
          !asset.claimed &&
          !asset.pending_claim);
      return matchSearch && matchStatus;
    });
  }, [categoryAssets, searchTerm, filterStatus]);

  // Analytics for current category
  const analytics = useMemo(() => {
    const a = categoryAssets;
    const claimed = a.filter((x) => x.claimed).length;
    const pending = a.filter((x) => x.pending_claim).length;
    const unclaimed = a.filter((x) => !x.claimed && !x.pending_claim).length;
    const mailSent = a.filter((x) => x.mail_sent).length;
    const noEmail = a.filter((x) => !x.assigned_email).length;
    return { total: a.length, claimed, pending, unclaimed, mailSent, noEmail };
  }, [categoryAssets]);

  // Bar chart data: by category (only for "all"), or by claim status per sub-group
  const barChartData = useMemo(() => {
    if (activeCategory === "all") {
      return Object.entries(CATEGORY_META)
        .filter(([k]) => k !== "all")
        .map(([k, v]) => ({
          label: v.label.split(" ")[0],
          value: assets.filter((a) => a.category === k).length,
        }));
    }
    return [
      { label: "Claimed", value: analytics.claimed },
      { label: "Pending", value: analytics.pending },
      { label: "Unclaimed", value: analytics.unclaimed },
      { label: "Mail Sent", value: analytics.mailSent },
      { label: "No Email", value: analytics.noEmail },
    ];
  }, [activeCategory, assets, analytics]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / ITEMS_PER_PAGE),
  );
  const pagedAssets = filteredAssets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSendMail = async (asset) => {
    if (!asset.assigned_email) {
      showToast("No email for this asset", "error");
      return;
    }
    setSendingId(asset.id);
    try {
      if (onSendMail) await onSendMail(asset.id);
      showToast(`Email sent to ${asset.assigned_email}`);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSendingId(null);
    }
  };

  const openEmailModal = (asset) => {
    setSelectedAsset(asset);
    setNewEmail(asset.assigned_email || "");
    setShowEmailModal(true);
  };

  const handleUpdateEmail = async () => {
    if (!selectedAsset || !newEmail) return;
    try {
      if (onUpdateEmail) await onUpdateEmail(selectedAsset.id, newEmail);
      setShowEmailModal(false);
      showToast("Email updated successfully!");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const Meta = CATEGORY_META[activeCategory];
  const CatIcon = Meta.icon;

  return (
    <div className="id-shell">
      {/* ── Sidebar ── */}
      <aside
        className={`id-sidebar ${sidebarOpen ? "id-sidebar-open" : "id-sidebar-collapsed"}`}
      >
        <div className="id-sidebar-brand">
          <div className="id-brand-logo">
            <Package size={18} />
          </div>
          {sidebarOpen && <span className="id-brand-name">InvenTrack</span>}
        </div>

        <nav className="id-nav">
          {sidebarOpen && <span className="id-nav-section">Categories</span>}
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const active = activeCategory === key;
            return (
              <button
                key={key}
                className={`id-nav-item ${active ? "id-nav-active" : ""}`}
                onClick={() => {
                  setActiveCategory(key);
                  setPage(1);
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                style={active ? { "--nav-color": meta.color } : {}}
                title={!sidebarOpen ? meta.label : ""}
              >
                <Icon size={17} className="id-nav-icon" />
                {sidebarOpen && (
                  <>
                    <span className="id-nav-label">{meta.label}</span>
                    <span
                      className="id-nav-badge"
                      style={{ background: active ? meta.color : "" }}
                    >
                      {categoryCounts[key]}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="id-sidebar-footer">
          {sidebarOpen && (
            <div className="id-sidebar-user">
              <div className="id-user-avatar">A</div>
              <div className="id-user-info">
                <span className="id-user-name">Admin</span>
                <span className="id-user-role">IT Manager</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="id-main">
        {/* Topbar */}
        <header className="id-header">
          <div className="id-header-left">
            <button
              className="id-collapse-btn"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <SlidersHorizontal size={17} />
            </button>
            <div className="id-header-title">
              <h1>{Meta.label}</h1>
              <span className="id-header-sub">Inventory Asset Management</span>
            </div>
          </div>
          <div className="id-header-right">
            <button className="id-icon-btn" title="Notifications">
              <Bell size={17} />
              <span className="id-notif-dot" />
            </button>
            <button className="id-btn-export">
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </header>

        {/* Analytics cards */}
        <section className="id-stats">
          {[
            {
              label: "Total Assets",
              value: analytics.total,
              icon: Package,
              color: "#2563eb",
              trend: "+12%",
            },
            {
              label: "Claimed",
              value: analytics.claimed,
              icon: CheckCircle,
              color: "#059669",
              trend: `${analytics.total ? Math.round((analytics.claimed / analytics.total) * 100) : 0}%`,
            },
            {
              label: "Pending Claim",
              value: analytics.pending,
              icon: Clock,
              color: "#d97706",
              trend: `${analytics.total ? Math.round((analytics.pending / analytics.total) * 100) : 0}%`,
            },
            {
              label: "Emails Sent",
              value: analytics.mailSent,
              icon: Send,
              color: "#7c3aed",
              trend: `${analytics.total ? Math.round((analytics.mailSent / analytics.total) * 100) : 0}%`,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                className="id-stat-card"
                key={i}
                style={{ "--stat-color": stat.color }}
              >
                <div className="id-stat-top">
                  <span className="id-stat-label">{stat.label}</span>
                  <div className="id-stat-icon-wrap">
                    <Icon size={16} />
                  </div>
                </div>
                <div className="id-stat-bottom">
                  <span className="id-stat-val">{stat.value}</span>
                  <span className="id-stat-trend">{stat.trend}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Charts row */}
        <section className="id-charts">
          {/* Bar chart */}
          <div className="id-chart-card id-chart-main">
            <div className="id-chart-head">
              <span className="id-chart-title">
                <BarChart2 size={15} />
                {activeCategory === "all"
                  ? "Assets by Category"
                  : "Claim Distribution"}
              </span>
            </div>
            <MiniBar data={barChartData} color={Meta.color} />
          </div>

          {/* Donut / summary */}
          <div className="id-chart-card id-chart-side">
            <div className="id-chart-head">
              <span className="id-chart-title">
                <Users size={15} />
                Claim Overview
              </span>
            </div>
            <div className="id-donut-wrap">
              <svg viewBox="0 0 80 80" className="id-donut">
                {(() => {
                  const total =
                    analytics.claimed +
                      analytics.pending +
                      analytics.unclaimed || 1;
                  const r = 30,
                    cx = 40,
                    cy = 40,
                    circ = 2 * Math.PI * r;
                  const segments = [
                    { val: analytics.claimed, color: "#059669" },
                    { val: analytics.pending, color: "#d97706" },
                    { val: analytics.unclaimed, color: "#dc2626" },
                  ];
                  let offset = 0;
                  return segments.map((seg, i) => {
                    const pct = seg.val / total;
                    const dash = pct * circ;
                    const el = (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={-offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
                <text
                  x="40"
                  y="37"
                  textAnchor="middle"
                  className="id-donut-num"
                >
                  {analytics.total}
                </text>
                <text
                  x="40"
                  y="47"
                  textAnchor="middle"
                  className="id-donut-sub"
                >
                  Total
                </text>
              </svg>
              <div className="id-donut-legend">
                {[
                  {
                    label: "Claimed",
                    val: analytics.claimed,
                    color: "#059669",
                  },
                  {
                    label: "Pending",
                    val: analytics.pending,
                    color: "#d97706",
                  },
                  {
                    label: "Unclaimed",
                    val: analytics.unclaimed,
                    color: "#dc2626",
                  },
                ].map((l, i) => (
                  <div key={i} className="id-legend-row">
                    <span
                      className="id-legend-dot"
                      style={{ background: l.color }}
                    />
                    <span className="id-legend-label">{l.label}</span>
                    <span className="id-legend-val">{l.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats card */}
          <div className="id-chart-card id-chart-quick">
            <div className="id-chart-head">
              <span className="id-chart-title">
                <Mail size={15} />
                Email Status
              </span>
            </div>
            <div className="id-quick-stats">
              <div className="id-qs-row">
                <span>Emails sent</span>
                <div className="id-qs-bar-wrap">
                  <div
                    className="id-qs-bar"
                    style={{
                      width: `${analytics.total ? (analytics.mailSent / analytics.total) * 100 : 0}%`,
                      background: "#7c3aed",
                    }}
                  />
                </div>
                <span className="id-qs-num">{analytics.mailSent}</span>
              </div>
              <div className="id-qs-row">
                <span>No email</span>
                <div className="id-qs-bar-wrap">
                  <div
                    className="id-qs-bar"
                    style={{
                      width: `${analytics.total ? (analytics.noEmail / analytics.total) * 100 : 0}%`,
                      background: "#dc2626",
                    }}
                  />
                </div>
                <span className="id-qs-num">{analytics.noEmail}</span>
              </div>
              <div className="id-qs-row">
                <span>Coverage</span>
                <div className="id-qs-bar-wrap">
                  <div
                    className="id-qs-bar"
                    style={{
                      width: `${analytics.total ? ((analytics.total - analytics.noEmail) / analytics.total) * 100 : 0}%`,
                      background: "#059669",
                    }}
                  />
                </div>
                <span className="id-qs-num">
                  {analytics.total
                    ? Math.round(
                        ((analytics.total - analytics.noEmail) /
                          analytics.total) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Table section */}
        <section className="id-table-section">
          <div className="id-table-head">
            <div className="id-table-title-row">
              <CatIcon size={16} style={{ color: Meta.color }} />
              <span className="id-table-title">Asset Details</span>
              <span className="id-table-count">
                {filteredAssets.length} records
              </span>
            </div>
            <div className="id-table-controls">
              <div className="id-search-wrap">
                <Search size={14} className="id-search-ico" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="id-search-clear"
                    onClick={() => setSearchTerm("")}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="id-select-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="claimed">Claimed</option>
                  <option value="pending">Pending</option>
                  <option value="unclaimed">Unclaimed</option>
                </select>
                <ChevronDown size={12} className="id-select-arrow" />
              </div>
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="id-empty">
              <AlertCircle size={36} />
              <p>No assets match your filters</p>
            </div>
          ) : (
            <>
              <div className="id-tbl-wrap">
                <table className="id-tbl">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Device Name</th>
                      <th>Serial No.</th>
                      <th>Assigned To</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Claim</th>
                      <th>Mail</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAssets.map((asset) => (
                      <tr key={asset.id} className="id-tbl-row">
                        <td>
                          <span className={`id-cat id-cat-${asset.category}`}>
                            {asset.category}
                          </span>
                        </td>
                        <td className="id-tbl-device">{asset.asset_name}</td>
                        <td>
                          <code className="id-serial">
                            {asset.serial_number}
                          </code>
                        </td>
                        <td className="id-tbl-person">
                          {asset.assigned_person_name}
                        </td>
                        <td>
                          {asset.assigned_email ? (
                            <a
                              href={`mailto:${asset.assigned_email}`}
                              className="id-email-link"
                            >
                              {asset.assigned_email}
                            </a>
                          ) : (
                            <span className="id-no-email">—</span>
                          )}
                        </td>
                        <td className="id-tbl-date">
                          {asset.assigned_date
                            ? new Date(asset.assigned_date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                        <td>
                          {asset.claimed ? (
                            <span className="id-badge id-badge-claimed">
                              <CheckCircle size={11} />
                              Claimed
                            </span>
                          ) : asset.pending_claim ? (
                            <span className="id-badge id-badge-pending">
                              <Clock size={11} />
                              Pending
                            </span>
                          ) : (
                            <span className="id-badge id-badge-unclaimed">
                              <AlertCircle size={11} />
                              Unclaimed
                            </span>
                          )}
                        </td>
                        <td>
                          {asset.mail_sent ? (
                            <span className="id-mail id-mail-yes">✓ Sent</span>
                          ) : (
                            <span className="id-mail id-mail-no">✗ No</span>
                          )}
                        </td>
                        <td>
                          <div className="id-tbl-actions">
                            <button
                              className="id-act-btn id-act-mail"
                              onClick={() => handleSendMail(asset)}
                              disabled={
                                !asset.assigned_email || sendingId === asset.id
                              }
                              title="Send email"
                            >
                              {sendingId === asset.id ? (
                                "…"
                              ) : (
                                <Mail size={14} />
                              )}
                            </button>
                            <button
                              className="id-act-btn id-act-edit"
                              onClick={() => openEmailModal(asset)}
                              title="Edit email"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="id-pagination">
                <span className="id-pg-info">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, filteredAssets.length)} of{" "}
                  {filteredAssets.length}
                </span>
                <div className="id-pg-controls">
                  <button
                    className="id-pg-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        className={`id-pg-num ${n === page ? "id-pg-active" : ""}`}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    className="id-pg-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* ── Email modal ── */}
      {showEmailModal && selectedAsset && (
        <div
          className="id-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowEmailModal(false)
          }
        >
          <div className="id-modal">
            <div className="id-modal-head">
              <h3>Update Email</h3>
              <button
                className="id-modal-close"
                onClick={() => setShowEmailModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="id-modal-body">
              <p className="id-modal-device-info">
                <strong>{selectedAsset.asset_name}</strong>
                <br />
                <span>
                  {selectedAsset.serial_number} ·{" "}
                  {selectedAsset.assigned_person_name}
                </span>
              </p>
              <label>Email address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@company.com"
              />
            </div>
            <div className="id-modal-foot">
              <button
                className="id-modal-cancel"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="id-modal-save"
                onClick={handleUpdateEmail}
                disabled={!newEmail}
              >
                Update & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`id-toast ${toast.type === "error" ? "id-toast-err" : ""}`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={14} />
          ) : (
            <CheckCircle size={14} />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
