// src/pages/userPage/AssignedInventoryPage.tsx
import React, { useState, useEffect } from 'react';
import { Mail, Send, Edit2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import {
  InventoryAssetListItem,
  InventoryFilterParams,
  PaginatedResponse,
} from '../../types/inventory';
import './AssignedInventory.css';

interface EmailUpdateModalProps {
  asset: InventoryAssetListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (email: string) => Promise<void>;
}

const EmailUpdateModal: React.FC<EmailUpdateModalProps> = ({
  asset,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) {
      setEmail(asset.assigned_email || '');
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email format');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onUpdate(email);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update Email Address</h3>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update & Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeviceRowProps {
  asset: InventoryAssetListItem;
  onEditEmail: (asset: InventoryAssetListItem) => void;
  onSendMail: (asset: InventoryAssetListItem) => Promise<void>;
}

const DeviceRow: React.FC<DeviceRowProps> = ({ asset, onEditEmail, onSendMail }) => {
  const [sendingMail, setSendingMail] = useState(false);

  const handleSendMail = async () => {
    try {
      setSendingMail(true);
      await onSendMail(asset);
    } finally {
      setSendingMail(false);
    }
  };

  return (
    <tr className="device-row">
      <td className="cell-category">{asset.category_display}</td>
      <td className="cell-asset">{asset.asset_name}</td>
      <td className="cell-serial">{asset.serial_number}</td>
      <td className="cell-person">{asset.assigned_person_name}</td>
      <td className="cell-email">
        <span className="email-text">{asset.assigned_email || 'N/A'}</span>
      </td>
      <td className="cell-date">
        {asset.assigned_date
          ? new Date(asset.assigned_date).toLocaleDateString()
          : 'N/A'}
      </td>
      <td className="cell-status">
        <span className={`status-badge status-${asset.status}`}>
          {asset.claimed ? (
            <>
              <CheckCircle size={14} /> Claimed
            </>
          ) : asset.pending_claim ? (
            <>
              <Clock size={14} /> Pending
            </>
          ) : (
            <>
              <AlertCircle size={14} /> Unclaimed
            </>
          )}
        </span>
      </td>
      <td className="cell-actions">
        <button
          className="btn-icon btn-edit"
          onClick={() => onEditEmail(asset)}
          title="Edit email"
        >
          <Edit2 size={16} />
        </button>
        <button
          className="btn-icon btn-send"
          onClick={handleSendMail}
          disabled={!asset.assigned_email || sendingMail || asset.mail_sent}
          title={asset.mail_sent ? 'Email already sent' : 'Send claim email'}
        >
          <Mail size={16} />
        </button>
      </td>
    </tr>
  );
};

const AssignedInventoryPage: React.FC = () => {
  const [assets, setAssets] = useState<InventoryAssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<InventoryFilterParams>({
    page: 1,
    page_size: 20,
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [emailModalAsset, setEmailModalAsset] = useState<InventoryAssetListItem | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await inventoryService.getAssignedInventory(filters.page || 1);
      setAssets(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = (asset: InventoryAssetListItem) => {
    setEmailModalAsset(asset);
    setEmailModalOpen(true);
  };

  const handleUpdateEmail = async (newEmail: string) => {
    if (!emailModalAsset) return;

    try {
      await inventoryService.updateAssignedEmail(emailModalAsset.id, {
        assigned_email: newEmail,
      });

      // Update local state
      setAssets((prev) =>
        prev.map((a) =>
          a.id === emailModalAsset.id ? { ...a, assigned_email: newEmail } : a
        )
      );

      setEmailModalOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleSendMail = async (asset: InventoryAssetListItem) => {
    try {
      await inventoryService.sendClaimMail(asset.id);

      // Update local state
      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, mail_sent: true } : a))
      );

      alert('Claim email sent successfully!');
    } catch (err: any) {
      alert('Failed to send email: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  };

  if (loading && assets.length === 0) {
    return (
      <div className="assigned-inventory-page">
        <div className="loading-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="assigned-inventory-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Assigned Inventory</h1>
          <p className="subtitle">Manage user device assignments and track claims</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Total Assigned</span>
            <span className="stat-value">{pagination.count}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by device name, serial, person, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="pc">PC</option>
            <option value="laptop">Laptop</option>
            <option value="mobile">Mobile</option>
            <option value="headphone">Headphone</option>
            <option value="connector">Connector</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="claimed">Claimed</option>
            <option value="pending_claim">Pending Claim</option>
          </select>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No Inventory Found</h3>
          <p>No assigned inventory matches your criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr className="table-header">
                <th>Category</th>
                <th>Device</th>
                <th>Serial No.</th>
                <th>Assigned To</th>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <DeviceRow
                  key={asset.id}
                  asset={asset}
                  onEditEmail={handleEditEmail}
                  onSendMail={handleSendMail}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          className="btn btn-secondary"
          onClick={handlePreviousPage}
          disabled={!pagination.previous || loading}
        >
          Previous
        </button>
        <span className="page-info">
          Page {filters.page || 1} of {Math.ceil(pagination.count / 20)}
        </span>
        <button
          className="btn btn-secondary"
          onClick={handleNextPage}
          disabled={!pagination.next || loading}
        >
          Next
        </button>
      </div>

      <EmailUpdateModal
        asset={emailModalAsset}
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onUpdate={handleUpdateEmail}
      />
    </div>
  );
};

export default AssignedInventoryPage;
