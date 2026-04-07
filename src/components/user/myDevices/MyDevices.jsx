import React, { useState, useEffect } from "react";
import { inventoryAPI } from "../../../services/api";
import { useAuth } from "../../../AuthContext/AuthContext";
import { mockDevices, mockAssignments } from "../../../assets/data/mockData";
import { Clock, AlertCircle } from "lucide-react";
import "./MyDevices.css";

const MyDevices = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    fetchAssignments();
    // Update countdowns every minute
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initial countdown update
    updateCountdowns();
  }, [assignments]);

  const updateCountdowns = () => {
    const now = new Date();
    const newCountdowns = {};

    assignments.forEach((assignment) => {
      if (assignment.expected_return_date) {
        const returnDate = new Date(assignment.expected_return_date);
        const diffMs = returnDate - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        newCountdowns[assignment.id] = {
          days: Math.max(0, diffDays),
          hours: Math.max(0, diffHours),
          minutes: Math.max(0, diffMinutes),
          isOverdue: diffMs < 0,
          isUrgent: diffDays <= 3 && diffMs >= 0,
        };
      }
    });

    setCountdowns(newCountdowns);
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await inventoryAPI.getMyAssignments();
      const assignmentsList = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      if (assignmentsList.length === 0) {
        // Fallback to mock data if needed
        setAssignments([]);
      } else {
        setAssignments(assignmentsList);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError(err.message || "Error loading devices");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExtendReturn = async (assignmentId) => {
    // This would call an API endpoint to extend the return date
    // For now, just show a message
    alert("Return extension feature coming soon!");
  };

  if (loading) {
    return (
      <div className="md-content-section" style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        Loading devices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-content-section" style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="md-content-section">
      <div className="md-section-header">
        <h2>Assigned Devices</h2>
        <span className="md-device-count">{assignments.length} devices</span>
      </div>
      <div className="md-devices-grid">
        {assignments.map((assignment) => {
          const device = assignment.device_details;
          const countdown = countdowns[assignment.id];

          return (
            <div key={assignment.id} className="md-device-card">
              <div className="md-device-header">
                {device?.image_url && (
                  <img
                    src={device.image_url}
                    alt="device"
                    className="md-device-image"
                  />
                )}
                <span className="md-device-type">{device?.device_type}</span>
                <span
                  className={`md-device-status ${assignment.status.toLowerCase()}`}
                >
                  {assignment.status.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="md-device-name">
                {device?.brand} {device?.model}
              </h3>
              <div className="md-device-details">
                <div className="md-detail-row">
                  <span className="md-detail-label">Device ID</span>
                  <span className="md-detail-value">{device?.device_id}</span>
                </div>
                <div className="md-detail-row">
                  <span className="md-detail-label">Serial Number</span>
                  <span className="md-detail-value">{device?.serial_number}</span>
                </div>
                <div className="md-detail-row">
                  <span className="md-detail-label">Assigned Date</span>
                  <span className="md-detail-value">
                    {formatDate(assignment.assigned_date)}
                  </span>
                </div>
                <div className="md-detail-row">
                  <span className="md-detail-label">Condition</span>
                  <span className="md-detail-value">{device?.condition}</span>
                </div>

                {/* Return Due Countdown */}
                {countdown && (
                  <div
                    className={`md-return-countdown ${
                      countdown.isOverdue
                        ? "overdue"
                        : countdown.isUrgent
                        ? "urgent"
                        : ""
                    }`}
                  >
                    <div className="countdown-header">
                      <Clock size={16} />
                      <span>Return Due</span>
                    </div>
                    {countdown.isOverdue ? (
                      <div className="countdown-overdue">
                        <AlertCircle size={18} />
                        <span>OVERDUE!</span>
                      </div>
                    ) : (
                      <div className="countdown-timer">
                        <span className="countdown-value">
                          {countdown.days}d {countdown.hours}h {countdown.minutes}m
                        </span>
                        <span className="return-date">
                          {formatDate(assignment.expected_return_date)}
                        </span>
                      </div>
                    )}
                    <button
                      className="btn-extend"
                      onClick={() => handleExtendReturn(assignment.id)}
                    >
                      Extend Return
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyDevices;
