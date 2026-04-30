// import React, { useState, useEffect } from "react";
// import { inventoryAPI } from "../../../services/api";
// import { useAuth } from "../../../AuthContext/AuthContext";
// import { mockDevices, mockAssignments } from "../../../assets/data/mockData";
// import { Clock, AlertCircle } from "lucide-react";
// import LoadingSpinner from "../../common/LoadingSpinner";
// import "./MyDevices.css";

// const MyDevices = () => {
//   const { user } = useAuth();
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [countdowns, setCountdowns] = useState({});

//   useEffect(() => {
//     fetchAssignments();
//     // Update countdowns every minute
//     const interval = setInterval(updateCountdowns, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     // Initial countdown update
//     updateCountdowns();
//   }, [assignments]);

//   const updateCountdowns = () => {
//     const now = new Date();
//     const newCountdowns = {};

//     assignments.forEach((assignment) => {
//       if (assignment.expected_return_date) {
//         const returnDate = new Date(assignment.expected_return_date);
//         const diffMs = returnDate - now;
//         const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//         const diffHours = Math.floor(
//           (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
//         );
//         const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

//         newCountdowns[assignment.id] = {
//           days: Math.max(0, diffDays),
//           hours: Math.max(0, diffHours),
//           minutes: Math.max(0, diffMinutes),
//           isOverdue: diffMs < 0,
//           isUrgent: diffDays <= 3 && diffMs >= 0,
//         };
//       }
//     });

//     setCountdowns(newCountdowns);
//   };

//   const fetchAssignments = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await inventoryAPI.getMyAssignments();
//       const assignmentsList = Array.isArray(res.data)
//         ? res.data
//         : res.data.results || [];

//       if (assignmentsList.length === 0) {
//         // Fallback to mock data if needed
//         setAssignments([]);
//       } else {
//         setAssignments(assignmentsList);
//       }
//     } catch (err) {
//       console.error("Failed to fetch assignments:", err);
//       setError(err.message || "Error loading devices");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const handleExtendReturn = async (assignmentId) => {
//     // This would call an API endpoint to extend the return date
//     // For now, just show a message
//     alert("Return extension feature coming soon!");
//   };

//   if (loading) {
//     return (
//       <div className="md-content-section">
//         <LoadingSpinner fullScreen={false} message="Loading your devices..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="md-content-section" style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
//         Error: {error}
//       </div>
//     );
//   }

//   return (
//     <div className="md-content-section">
//       <div className="md-section-header">
//         <h2>Assigned Devices</h2>
//         <span className="md-device-count">{assignments.length} devices</span>
//       </div>
//       <div className="md-devices-grid">
//         {assignments.map((assignment) => {
//           const device = assignment.device_details;
//           const countdown = countdowns[assignment.id];

//           return (
//             <div key={assignment.id} className="md-device-card">
//               <div className="md-device-header">
//                 {device?.image_url && (
//                   <img
//                     src={device.image_url}
//                     alt="device"
//                     className="md-device-image"
//                   />
//                 )}
//                 <span className="md-device-type">{device?.device_type}</span>
//                 <span
//                   className={`md-device-status ${assignment.status.toLowerCase()}`}
//                 >
//                   {assignment.status.replace(/_/g, " ")}
//                 </span>
//               </div>
//               <h3 className="md-device-name">
//                 {device?.brand} {device?.model}
//               </h3>
//               <div className="md-device-details">
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Device ID</span>
//                   <span className="md-detail-value">{device?.device_id}</span>
//                 </div>
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Serial Number</span>
//                   <span className="md-detail-value">{device?.serial_number}</span>
//                 </div>
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Assigned Date</span>
//                   <span className="md-detail-value">
//                     {formatDate(assignment.assigned_date)}
//                   </span>
//                 </div>
//                 <div className="md-detail-row">
//                   <span className="md-detail-label">Condition</span>
//                   <span className="md-detail-value">{device?.condition}</span>
//                 </div>

//                 {/* Return Due Countdown */}
//                 {countdown && (
//                   <div
//                     className={`md-return-countdown ${
//                       countdown.isOverdue
//                         ? "overdue"
//                         : countdown.isUrgent
//                         ? "urgent"
//                         : ""
//                     }`}
//                   >
//                     <div className="countdown-header">
//                       <Clock size={16} />
//                       <span>Return Due</span>
//                     </div>
//                     {countdown.isOverdue ? (
//                       <div className="countdown-overdue">
//                         <AlertCircle size={18} />
//                         <span>OVERDUE!</span>
//                       </div>
//                     ) : (
//                       <div className="countdown-timer">
//                         <span className="countdown-value">
//                           {countdown.days}d {countdown.hours}h {countdown.minutes}m
//                         </span>
//                         <span className="return-date">
//                           {formatDate(assignment.expected_return_date)}
//                         </span>
//                       </div>
//                     )}
//                     <button
//                       className="btn-extend"
//                       onClick={() => handleExtendReturn(assignment.id)}
//                     >
//                       Extend Return
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default MyDevices;

import React, { useState, useEffect } from "react";
import { inventoryAPI } from "../../../services/api";
import { useAuth } from "../../../AuthContext/AuthContext";
import { Clock, AlertCircle } from "lucide-react";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./MyDevices.css";

const MyDevices = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  // ── Lifecycle (original unchanged) ───────────────────────
  useEffect(() => {
    fetchAssignments();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateCountdowns();
  }, [assignments]);

  // ── Countdown logic (original unchanged) ─────────────────
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
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );

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

  // ── API fetch (original unchanged) ───────────────────────
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await inventoryAPI.getMyAssignments();
      const assignmentsList = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      setAssignments(assignmentsList.length === 0 ? [] : assignmentsList);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError(err.message || "Error loading devices");
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers (original unchanged) ─────────────────────────
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExtendReturn = async (assignmentId) => {
    alert("Return extension feature coming soon!");
  };

  // ── Loading / error (original unchanged) ─────────────────
  if (loading) {
    return (
      <div className="md-content-section">
        <LoadingSpinner fullScreen={false} message="Loading your devices..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-content-section md-error">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="md-content-section">

      {/* ── Top bar ───────────────────────────────────────── */}
      <div className="md-section-header">
        <div className="md-header-left">
          <h2>Assigned devices</h2>
          <p className="md-header-sub">Your currently assigned company equipment</p>
        </div>
        <span className="md-device-count">{assignments.length} devices</span>
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {assignments.length === 0 && (
        <div className="md-empty">
          <p className="md-empty-title">No devices assigned</p>
          <p className="md-empty-sub">Devices assigned to you will appear here.</p>
        </div>
      )}

      {/* ── Device grid ───────────────────────────────────── */}
      <div className="md-devices-grid">
        {assignments.map((assignment) => {
          const device = assignment.device_details;
          const countdown = countdowns[assignment.id];
          const countdownClass = countdown
            ? countdown.isOverdue
              ? "overdue"
              : countdown.isUrgent
              ? "urgent"
              : "normal"
            : "normal";

          return (
            <div
              key={assignment.id}
              className={`md-device-card md-card-${assignment.status.toLowerCase()}`}
            >
              {/* Card top: type pill + status */}
              <div className="md-device-header">
                <span className="md-device-type">{device?.device_type}</span>
                <span className={`md-device-status ${assignment.status.toLowerCase()}`}>
                  {assignment.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Optional device image (original) */}
              {device?.image_url && (
                <img
                  src={device.image_url}
                  alt="device"
                  className="md-device-image"
                />
              )}

              {/* Device name */}
              <h3 className="md-device-name">
                {device?.brand} {device?.model}
              </h3>

              {/* Detail rows (original fields) */}
              <div className="md-device-details">
                <table className="md-detail-table">
                  <tbody>
                    <tr>
                      <td className="md-detail-label">Device ID</td>
                      <td className="md-detail-value">{device?.device_id}</td>
                    </tr>
                    <tr>
                      <td className="md-detail-label">Serial number</td>
                      <td className="md-detail-value">{device?.serial_number}</td>
                    </tr>
                    <tr>
                      <td className="md-detail-label">Assigned date</td>
                      <td className="md-detail-value">
                        {formatDate(assignment.assigned_date)}
                      </td>
                    </tr>
                    <tr>
                      <td className="md-detail-label">Condition</td>
                      <td className="md-detail-value">{device?.condition}</td>
                    </tr>
                  </tbody>
                </table>

                {/* ── Return countdown (original logic, new layout) ── */}
                {countdown && (
                  <div className={`md-return-countdown ${countdownClass}`}>
                    <div className="countdown-header">
                      <Clock size={13} />
                      <span>
                        {countdown.isOverdue
                          ? "Overdue"
                          : countdown.isUrgent
                          ? "Return due — urgent"
                          : "Return due"}
                      </span>
                    </div>

                    {countdown.isOverdue ? (
                      <div className="countdown-overdue">
                        <AlertCircle size={16} />
                        <span>Return immediately</span>
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
                      {countdown.isOverdue ? "Request extension" : "Extend return"}
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