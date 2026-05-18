// // src/components/admin/inventoryAssets/InventoryAssetsView.jsx
// import React, { useState, useMemo } from 'react';
// import {
//   Search,
//   Filter,
//   Download,
//   Mail,
//   Edit2,
//   Eye,
//   CheckCircle,
//   Clock,
//   AlertCircle,
// } from 'lucide-react';
// import './InventoryAssetsView.css';

// const InventoryAssetsView = ({ assets = [], onSendMail, onUpdateEmail, loading }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterCategory, setFilterCategory] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterClaimed, setFilterClaimed] = useState('all');
//   const [selectedAsset, setSelectedAsset] = useState(null);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [newEmail, setNewEmail] = useState('');
//   const [sendingMail, setSendingMail] = useState(false);
//   const [updatingEmail, setUpdatingEmail] = useState(false);

//   const filteredAssets = useMemo(() => {
//     return (assets || []).filter((asset) => {
//       const matchesSearch =
//         asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         asset.assigned_person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (asset.assigned_email && asset.assigned_email.toLowerCase().includes(searchTerm.toLowerCase()));

//       const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;

//       const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;

//       const matchesClaimed =
//         filterClaimed === 'all' ||
//         (filterClaimed === 'claimed' && asset.claimed) ||
//         (filterClaimed === 'pending' && asset.pending_claim) ||
//         (filterClaimed === 'unclaimed' && !asset.claimed && !asset.pending_claim);

//       return matchesSearch && matchesCategory && matchesStatus && matchesClaimed;
//     });
//   }, [assets, searchTerm, filterCategory, filterStatus, filterClaimed]);

//   const stats = useMemo(() => {
//     return {
//       total: assets.length,
//       claimed: assets.filter((a) => a.claimed).length,
//       pending: assets.filter((a) => a.pending_claim).length,
//       mailSent: assets.filter((a) => a.mail_sent).length,
//     };
//   }, [assets]);

//   const handleSendMail = async (asset) => {
//     if (!asset.assigned_email) {
//       alert('No email address for this asset');
//       return;
//     }

//     try {
//       setSendingMail(true);
//       await onSendMail(asset.id);
//       alert('Email sent successfully!');
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     } finally {
//       setSendingMail(false);
//     }
//   };

//   const handleUpdateEmail = async () => {
//     if (!selectedAsset || !newEmail) return;

//     try {
//       setUpdatingEmail(true);
//       await onUpdateEmail(selectedAsset.id, newEmail);
//       setShowEmailModal(false);
//       setNewEmail('');
//       alert('Email updated successfully!');
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     } finally {
//       setUpdatingEmail(false);
//     }
//   };

//   const openEmailModal = (asset) => {
//     setSelectedAsset(asset);
//     setNewEmail(asset.assigned_email || '');
//     setShowEmailModal(true);
//   };

//   if (loading) {
//     return (
//       <div className="inventory-assets-view">
//         <div className="loading">Loading inventory assets...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="inventory-assets-view">
//       {/* Header */}
//       <div className="view-header">
//         <div>
//           <h2>CSV Imported Inventory Assets</h2>
//           <p className="view-subtitle">Manage devices imported from CSV files</p>
//         </div>
//         <button className="btn-export">
//           <Download size={18} />
//           Export
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <span className="stat-label">Total Assets</span>
//           <span className="stat-value">{stats.total}</span>
//         </div>
//         <div className="stat-card">
//           <span className="stat-label">Claimed</span>
//           <span className="stat-value" style={{ color: '#10b981' }}>
//             {stats.claimed}
//           </span>
//         </div>
//         <div className="stat-card">
//           <span className="stat-label">Pending Claim</span>
//           <span className="stat-value" style={{ color: '#f59e0b' }}>
//             {stats.pending}
//           </span>
//         </div>
//         <div className="stat-card">
//           <span className="stat-label">Emails Sent</span>
//           <span className="stat-value" style={{ color: '#3b82f6' }}>
//             {stats.mailSent}
//           </span>
//         </div>
//       </div>

//       {/* Filters & Search */}
//       <div className="filters-section">
//         <div className="search-box">
//           <Search size={18} />
//           <input
//             type="text"
//             placeholder="Search by device, serial, person, email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="filter-group">
//           <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
//             <option value="all">All Categories</option>
//             <option value="pc">PC</option>
//             <option value="laptop">Laptop</option>
//             <option value="mobile">Mobile</option>
//             <option value="headphone">Headphone</option>
//             <option value="connector">Connector</option>
//           </select>

//           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//             <option value="all">All Status</option>
//             <option value="pending_claim">Pending Claim</option>
//             <option value="claimed">Claimed</option>
//             <option value="assigned">Assigned</option>
//           </select>

//           <select value={filterClaimed} onChange={(e) => setFilterClaimed(e.target.value)}>
//             <option value="all">All Claim Status</option>
//             <option value="claimed">Claimed</option>
//             <option value="pending">Pending</option>
//             <option value="unclaimed">Unclaimed</option>
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       {filteredAssets.length === 0 ? (
//         <div className="empty-state">
//           <AlertCircle size={48} />
//           <h3>No Assets Found</h3>
//           <p>No inventory assets match your criteria</p>
//         </div>
//       ) : (
//         <div className="table-wrapper">
//           <table className="assets-table">
//             <thead>
//               <tr>
//                 <th>Category</th>
//                 <th>Device Name</th>
//                 <th>Serial No.</th>
//                 <th>Assigned To</th>
//                 <th>Email</th>
//                 <th>Assigned Date</th>
//                 <th>Claim Status</th>
//                 <th>Mail Sent</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredAssets.map((asset) => (
//                 <tr key={asset.id} className="asset-row">
//                   <td className="cell-category">
//                     <span className={`category-badge category-${asset.category}`}>
//                       {asset.category_display || asset.category}
//                     </span>
//                   </td>
//                   <td className="cell-device">{asset.asset_name}</td>
//                   <td className="cell-serial">
//                     <code>{asset.serial_number}</code>
//                   </td>
//                   <td className="cell-person">{asset.assigned_person_name}</td>
//                   <td className="cell-email">
//                     {asset.assigned_email ? (
//                       <a href={`mailto:${asset.assigned_email}`}>{asset.assigned_email}</a>
//                     ) : (
//                       <span className="no-email">No email</span>
//                     )}
//                   </td>
//                   <td className="cell-date">
//                     {asset.assigned_date
//                       ? new Date(asset.assigned_date).toLocaleDateString()
//                       : 'N/A'}
//                   </td>
//                   <td className="cell-status">
//                     {asset.claimed ? (
//                       <span className="status-badge status-claimed">
//                         <CheckCircle size={14} />
//                         Claimed
//                       </span>
//                     ) : asset.pending_claim ? (
//                       <span className="status-badge status-pending">
//                         <Clock size={14} />
//                         Pending
//                       </span>
//                     ) : (
//                       <span className="status-badge status-unclaimed">
//                         <AlertCircle size={14} />
//                         Unclaimed
//                       </span>
//                     )}
//                   </td>
//                   <td className="cell-mail">
//                     {asset.mail_sent ? (
//                       <span className="mail-sent">✓ Sent</span>
//                     ) : (
//                       <span className="mail-not-sent">✗ Not sent</span>
//                     )}
//                   </td>
//                   <td className="cell-actions">
//                     <button
//                       className="btn-action btn-email"
//                       onClick={() => handleSendMail(asset)}
//                       disabled={!asset.assigned_email || sendingMail}
//                       title="Send claim email"
//                     >
//                       <Mail size={16} />
//                     </button>
//                     <button
//                       className="btn-action btn-edit"
//                       onClick={() => openEmailModal(asset)}
//                       title="Edit email"
//                     >
//                       <Edit2 size={16} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Email Update Modal */}
//       {showEmailModal && selectedAsset && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>Update Email Address</h3>
//               <button className="modal-close" onClick={() => setShowEmailModal(false)}>
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label>Email Address</label>
//                 <input
//                   type="email"
//                   value={newEmail}
//                   onChange={(e) => setNewEmail(e.target.value)}
//                   placeholder="user@company.com"
//                   disabled={updatingEmail}
//                 />
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setShowEmailModal(false)}
//                 disabled={updatingEmail}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={handleUpdateEmail}
//                 disabled={updatingEmail || !newEmail}
//               >
//                 {updatingEmail ? 'Updating...' : 'Update & Send Email'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InventoryAssetsView;

// src/components/admin/inventoryAssets/InventoryAssetsView.jsx
import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Mail,
  Edit2,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import "./InventoryAssetsView.css";

const ITEMS_PER_PAGE = 8;

const InventoryAssetsView = ({
  assets = [],
  onSendMail,
  onUpdateEmail,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClaimed, setFilterClaimed] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const filteredAssets = useMemo(() => {
    setPage(1);
    return (assets || []).filter((asset) => {
      const matchesSearch =
        asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assigned_person_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (asset.assigned_email &&
          asset.assigned_email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesCategory =
        filterCategory === "all" || asset.category === filterCategory;
      const matchesStatus =
        filterStatus === "all" || asset.status === filterStatus;
      const matchesClaimed =
        filterClaimed === "all" ||
        (filterClaimed === "claimed" && asset.claimed) ||
        (filterClaimed === "pending" && asset.pending_claim) ||
        (filterClaimed === "unclaimed" &&
          !asset.claimed &&
          !asset.pending_claim);

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesClaimed
      );
    });
  }, [assets, searchTerm, filterCategory, filterStatus, filterClaimed]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / ITEMS_PER_PAGE),
  );
  const pagedAssets = filteredAssets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const stats = useMemo(
    () => ({
      total: assets.length,
      claimed: assets.filter((a) => a.claimed).length,
      pending: assets.filter((a) => a.pending_claim).length,
      mailSent: assets.filter((a) => a.mail_sent).length,
    }),
    [assets],
  );

  const handleSendMail = async (asset) => {
    if (!asset.assigned_email) {
      showToast("No email address for this asset");
      return;
    }
    try {
      setSendingMail(true);
      await onSendMail(asset.id);
      showToast("Email sent to " + asset.assigned_email);
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setSendingMail(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!selectedAsset || !newEmail) return;
    try {
      setUpdatingEmail(true);
      await onUpdateEmail(selectedAsset.id, newEmail);
      setShowEmailModal(false);
      setNewEmail("");
      showToast("Email updated successfully!");
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setUpdatingEmail(false);
    }
  };

  const openEmailModal = (asset) => {
    setSelectedAsset(asset);
    setNewEmail(asset.assigned_email || "");
    setShowEmailModal(true);
  };

  if (loading) {
    return (
      <div className="iav-loading">
        <Package size={32} className="iav-loading-icon" />
        <p>Loading inventory assets…</p>
      </div>
    );
  }

  return (
    <div className="iav-root">
      {/* ── Top bar ── */}
      <div className="iav-topbar">
        <div className="iav-topbar-left">
          <Package size={20} className="iav-topbar-icon" />
          <div>
            <h2 className="iav-title">CSV imported inventory assets</h2>
            <p className="iav-subtitle">
              Manage devices imported from CSV files
            </p>
          </div>
        </div>
        <button className="iav-btn-export">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="iav-stats">
        <div className="iav-stat">
          <span className="iav-stat-label">Total assets</span>
          <span className="iav-stat-val">{stats.total}</span>
        </div>
        <div className="iav-stat">
          <span className="iav-stat-label">Claimed</span>
          <span className="iav-stat-val iav-green">{stats.claimed}</span>
        </div>
        <div className="iav-stat">
          <span className="iav-stat-label">Pending claim</span>
          <span className="iav-stat-val iav-amber">{stats.pending}</span>
        </div>
        <div className="iav-stat">
          <span className="iav-stat-label">Emails sent</span>
          <span className="iav-stat-val iav-teal">{stats.mailSent}</span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="iav-filterbar">
        <div className="iav-search">
          <Search size={16} className="iav-search-icon" />
          <input
            type="text"
            placeholder="Search device, serial, person, email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="iav-selects">
          <SlidersHorizontal size={15} className="iav-filter-icon" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            <option value="pc">PC</option>
            <option value="laptop">Laptop</option>
            <option value="mobile">Mobile</option>
            <option value="headphone">Headphone</option>
            <option value="connector">Connector</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="pending_claim">Pending claim</option>
            <option value="claimed">Claimed</option>
            <option value="assigned">Assigned</option>
          </select>
          <select
            value={filterClaimed}
            onChange={(e) => setFilterClaimed(e.target.value)}
          >
            <option value="all">All claim status</option>
            <option value="claimed">Claimed</option>
            <option value="pending">Pending</option>
            <option value="unclaimed">Unclaimed</option>
          </select>
          <span className="iav-count">
            {filteredAssets.length} of {assets.length}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      {filteredAssets.length === 0 ? (
        <div className="iav-empty">
          <AlertCircle size={40} />
          <p>No assets match your filters</p>
        </div>
      ) : (
        <>
          <div className="iav-table-wrap">
            <table className="iav-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Device name</th>
                  <th>Serial no.</th>
                  <th>Assigned to</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Claim</th>
                  <th>Mail</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedAssets.map((asset) => (
                  <tr key={asset.id} className="iav-row">
                    <td>
                      <span className={`iav-cat iav-cat-${asset.category}`}>
                        {asset.category_display || asset.category}
                      </span>
                    </td>
                    <td className="iav-device">{asset.asset_name}</td>
                    <td>
                      <code className="iav-code">{asset.serial_number}</code>
                    </td>
                    <td className="iav-person">{asset.assigned_person_name}</td>
                    <td>
                      {asset.assigned_email ? (
                        <a
                          className="iav-email-link"
                          href={`mailto:${asset.assigned_email}`}
                        >
                          {asset.assigned_email}
                        </a>
                      ) : (
                        <span className="iav-no-email">No email</span>
                      )}
                    </td>
                    <td className="iav-date">
                      {asset.assigned_date
                        ? new Date(asset.assigned_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      {asset.claimed ? (
                        <span className="iav-badge iav-badge-claimed">
                          <CheckCircle size={12} />
                          Claimed
                        </span>
                      ) : asset.pending_claim ? (
                        <span className="iav-badge iav-badge-pending">
                          <Clock size={12} />
                          Pending
                        </span>
                      ) : (
                        <span className="iav-badge iav-badge-unclaimed">
                          <AlertCircle size={12} />
                          Unclaimed
                        </span>
                      )}
                    </td>
                    <td>
                      {asset.mail_sent ? (
                        <span className="iav-mail iav-mail-sent">✓ Sent</span>
                      ) : (
                        <span className="iav-mail iav-mail-no">✗ Not sent</span>
                      )}
                    </td>
                    <td>
                      <div className="iav-actions">
                        <button
                          className="iav-act iav-act-mail"
                          onClick={() => handleSendMail(asset)}
                          disabled={!asset.assigned_email || sendingMail}
                          title="Send claim email"
                        >
                          <Mail size={15} />
                        </button>
                        <button
                          className="iav-act iav-act-edit"
                          onClick={() => openEmailModal(asset)}
                          title="Edit email"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="iav-pagination">
            <button
              className="iav-pg-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="iav-pg-info">
              <strong>{String(page).padStart(2, "0")}</strong>
              <span className="iav-pg-of">
                of {String(totalPages).padStart(2, "0")}
              </span>
            </span>
            <button
              className="iav-pg-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}

      {/* ── Email modal ── */}
      {showEmailModal && selectedAsset && (
        <div
          className="iav-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowEmailModal(false)
          }
        >
          <div className="iav-modal">
            <div className="iav-modal-head">
              <h3>Update email address</h3>
              <button
                className="iav-modal-close"
                onClick={() => setShowEmailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="iav-modal-body">
              <p className="iav-modal-device">
                <strong>{selectedAsset.asset_name}</strong> —{" "}
                {selectedAsset.assigned_person_name}
              </p>
              <div className="iav-form-group">
                <label>Email address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@company.com"
                  disabled={updatingEmail}
                />
              </div>
            </div>
            <div className="iav-modal-foot">
              <button
                className="iav-btn-cancel"
                onClick={() => setShowEmailModal(false)}
                disabled={updatingEmail}
              >
                Cancel
              </button>
              <button
                className="iav-btn-save"
                onClick={handleUpdateEmail}
                disabled={updatingEmail || !newEmail}
              >
                {updatingEmail ? "Updating…" : "Update & send email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="iav-toast">{toast}</div>}
    </div>
  );
};

export default InventoryAssetsView;
