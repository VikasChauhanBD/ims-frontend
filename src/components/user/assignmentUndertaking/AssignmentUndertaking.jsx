import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import ConsentForm from "../../common/ConsentForm";
import { inventoryAPI } from "../../../services/api";
import "./AssignmentUndertaking.css";

export default function AssignmentUndertaking() {
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPendingAssignments();
  }, []);

  const fetchPendingAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryAPI.getAssignments({
        status: "approved",
      });
      const assignments = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setPendingAssignments(assignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError(err.message || "Failed to fetch pending assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleStartUndertaking = (assignment) => {
    setSelectedAssignment(assignment);
    setShowConsentForm(true);
  };

  const handleSubmitConsent = async (consentData) => {
    if (!selectedAssignment) return;

    setSubmitting(true);
    try {
      await inventoryAPI.submitConsent(selectedAssignment.id, consentData);

      setSuccessMessage(
        "Consent form submitted successfully! Admin will review and approve."
      );
      setShowConsentForm(false);
      setSelectedAssignment(null);

      // Refresh the list
      await fetchPendingAssignments();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error submitting consent:", err);
      setError(err.message || "Failed to submit consent form");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="undertaking-container">
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Loading pending assignments...
        </div>
      </div>
    );
  }

  return (
    <div className="undertaking-container">
      <div className="undertaking-header">
        <h2>Device Assignment Undertaking</h2>
        <p>
          Complete the undertaking form for newly assigned devices
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {pendingAssignments.length === 0 ? (
        <div className="no-pending">
          <CheckCircle size={48} />
          <p>No pending assignments</p>
          <span>All your device assignments are up to date</span>
        </div>
      ) : (
        <div className="assignments-list">
          {pendingAssignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-info">
                <h3>{assignment.device_details?.name || "Device"}</h3>
                <div className="assignment-details">
                  <div className="detail-row">
                    <span className="label">Device ID:</span>
                    <span className="value">
                      {assignment.device_details?.device_id}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Type:</span>
                    <span className="value">
                      {assignment.device_details?.device_type}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Brand:</span>
                    <span className="value">
                      {assignment.device_details?.brand}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Model:</span>
                    <span className="value">
                      {assignment.device_details?.model}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Condition:</span>
                    <span className={`condition ${assignment.device_details?.condition}`}>
                      {assignment.device_details?.condition}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Expected Return:</span>
                    <span className="value">
                      {new Date(assignment.expected_return_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="assignment-actions">
                <button
                  className="btn-undertaking"
                  onClick={() => handleStartUndertaking(assignment)}
                  disabled={submitting}
                >
                  Complete Undertaking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConsentForm && selectedAssignment && (
        <ConsentForm
          assignment={selectedAssignment}
          isOpen={showConsentForm}
          onClose={() => {
            setShowConsentForm(false);
            setSelectedAssignment(null);
          }}
          onSubmit={handleSubmitConsent}
          isLoading={submitting}
        />
      )}
    </div>
  );
}
