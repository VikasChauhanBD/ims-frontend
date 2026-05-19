// src/pages/userPage/MyInventoryPage.tsx
import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, Download, ChevronDown } from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import { InventoryAsset, PaginatedResponse } from '../../types/inventory';
import './MyInventory.css';

interface DeviceDetailsModalProps {
  asset: InventoryAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onClaim?: () => Promise<void>;
}

const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  asset,
  isOpen,
  onClose,
  onClaim,
}) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!asset || !onClaim) return;

    try {
      setClaiming(true);
      await onClaim();
      onClose();
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <h2>Device Details</h2>
          <button className="modal-close" onClick={onClose} disabled={claiming}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Device Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Category</label>
                <span>{asset.category_display}</span>
              </div>
              <div className="detail-item">
                <label>Device Name</label>
                <span>{asset.asset_name}</span>
              </div>
              <div className="detail-item">
                <label>Serial Number</label>
                <span>{asset.serial_number}</span>
              </div>
              <div className="detail-item">
                <label>Condition</label>
                <span className={`condition-badge condition-${asset.condition}`}>
                  {asset.condition}
                </span>
              </div>
            </div>
          </div>

          {asset.metadata && Object.keys(asset.metadata).length > 0 && (
            <div className="detail-section">
              <h3>Technical Specifications</h3>
              <div className="detail-grid">
                {Object.entries(asset.metadata).map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <label>{key.replace(/_/g, ' ')}</label>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Assignment Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Assigned To</label>
                <span>{asset.assigned_person_name}</span>
              </div>
              <div className="detail-item">
                <label>Assigned Date</label>
                <span>
                  {asset.assigned_date
                    ? new Date(asset.assigned_date).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge status-${asset.status}`}>
                  {asset.status_display}
                </span>
              </div>
              <div className="detail-item">
                <label>Claim Status</label>
                {asset.claimed ? (
                  <span className="badge badge-success">
                    <Check size={14} /> Claimed
                  </span>
                ) : asset.pending_claim ? (
                  <span className="badge badge-warning">
                    <Clock size={14} /> Pending
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {asset.remarks && (
            <div className="detail-section">
              <h3>Remarks</h3>
              <p className="remarks-text">{asset.remarks}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={claiming}
          >
            Close
          </button>
          {!asset.claimed && onClaim && (
            <button
              className="btn btn-primary"
              onClick={handleClaim}
              disabled={claiming}
            >
              {claiming ? 'Processing...' : 'Accept Device'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface DeviceCardProps {
  asset: InventoryAsset;
  onViewDetails: (asset: InventoryAsset) => void;
  onClaim: (assetId: string) => Promise<void>;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ asset, onViewDetails, onClaim }) => {
  const [claiming, setClaiming] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await onClaim(asset.id);
      alert('Device accepted successfully!');
    } catch (err: any) {
      alert('Failed to accept device: ' + (err.response?.data?.error || err.message));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="device-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{asset.asset_name}</h3>
          <span className={`badge badge-category category-${asset.category}`}>
            {asset.category_display}
          </span>
        </div>
        <div className={`card-status ${asset.status}`}>
          {asset.claimed ? (
            <>
              <Check size={18} /> Claimed
            </>
          ) : asset.pending_claim ? (
            <>
              <Clock size={18} /> Pending Claim
            </>
          ) : null}
        </div>
      </div>

      <div className="card-body">
        <div className="card-info">
          <div className="info-item">
            <span className="info-label">Serial Number:</span>
            <span className="info-value">{asset.serial_number}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Assigned Date:</span>
            <span className="info-value">
              {asset.assigned_date
                ? new Date(asset.assigned_date).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Condition:</span>
            <span className={`condition-badge condition-${asset.condition}`}>
              {asset.condition}
            </span>
          </div>
        </div>

        {expanded && asset.metadata && Object.keys(asset.metadata).length > 0 && (
          <div className="card-specs">
            <h4>Specifications</h4>
            <div className="specs-grid">
              {Object.entries(asset.metadata)
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key.replace(/_/g, ' ')}:</span>
                    <span className="spec-value">{String(value)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          className="btn-expand"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Show less' : 'Show more'}
        >
          <ChevronDown size={18} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onViewDetails(asset)}
        >
          View Details
        </button>
        {!asset.claimed && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleClaim}
            disabled={claiming}
          >
            {claiming ? 'Processing...' : 'Accept Now'}
          </button>
        )}
      </div>
    </div>
  );
};

const MyInventoryPage: React.FC = () => {
  const pageSize = 1000;
  const [assets, setAssets] = useState<InventoryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<InventoryAsset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchMyInventory();
  }, [page]);

  const fetchMyInventory = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await inventoryService.getMyInventory(page);
      setAssets(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load your inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (asset: InventoryAsset) => {
    setSelectedAsset(asset);
    setModalOpen(true);
  };

  const handleClaimDevice = async (assetId: string) => {
    try {
      await inventoryService.claimDevice(assetId);

      // Update local state
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? { ...a, claimed: true, pending_claim: false, status: 'claimed' }
            : a
        )
      );
    } catch (err: any) {
      throw err;
    }
  };

  const filteredAssets =
    filterStatus === 'all'
      ? assets
      : filterStatus === 'claimed'
        ? assets.filter((a) => a.claimed)
        : filterStatus === 'pending'
          ? assets.filter((a) => a.pending_claim)
          : assets;

  if (loading && assets.length === 0) {
    return (
      <div className="my-inventory-page">
        <div className="loading-container">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-inventory-page">
      <div className="page-header">
        <div className="header-content">
          <h1>My Inventory</h1>
          <p className="subtitle">Review the devices assigned to you and accept them here</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" title="Download inventory">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({assets.length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'claimed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('claimed')}
            >
              Claimed ({assets.filter((a) => a.claimed).length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({assets.filter((a) => a.pending_claim).length})
            </button>
          </div>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>
            {assets.length === 0 ? 'No Devices Assigned' : 'No devices match filter'}
          </h3>
          <p>
            {assets.length === 0
              ? 'You have no devices assigned yet. Check back later!'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="devices-grid">
          {filteredAssets.map((asset) => (
            <DeviceCard
              key={asset.id}
              asset={asset}
              onViewDetails={handleViewDetails}
              onClaim={handleClaimDevice}
            />
          ))}
        </div>
      )}

      {pagination.count > pageSize && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={() => setPage((p) => p - 1)}
            disabled={!pagination.previous || loading}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {Math.ceil(pagination.count / pageSize)}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.next || loading}
          >
            Next
          </button>
        </div>
      )}

      <DeviceDetailsModal
        asset={selectedAsset}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onClaim={() =>
          selectedAsset ? handleClaimDevice(selectedAsset.id) : Promise.resolve()
        }
      />
    </div>
  );
};

export default MyInventoryPage;
