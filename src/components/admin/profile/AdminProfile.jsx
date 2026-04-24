// import React, { useState, useEffect } from "react";
// import { useAuth } from "../../../AuthContext/AuthContext";
// import { authAPI } from "../../../services/api";
// import LoadingSpinner from "../../common/LoadingSpinner";
// import "./AdminProfile.css";
// import AnimatedBackground from "../../animatedBackground/AnimatedBackground";

// const AdminProfile = () => {
//   const { user } = useAuth();
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await authAPI.getCurrentUser();
//       setEmployee(response.data);
//     } catch (err) {
//       setError(err.message || "Failed to load profile");
//       console.error("Error fetching profile:", err);
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

//   if (loading) {
//     return (
//       <div className="admin-profile-container">
//         <AnimatedBackground />
//         <LoadingSpinner fullScreen={false} message="Loading profile..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="admin-profile-container">
//         <AnimatedBackground />
//         <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
//           Error: {error}
//         </div>
//       </div>
//     );
//   }

//   if (!employee) {
//     return (
//       <div className="admin-profile-container">
//         <AnimatedBackground />
//         <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
//           No profile information available
//         </div>
//       </div>
//     );
//   }

//   // Generate avatar based on email
//   const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`;

//   return (
//     <div className="admin-profile-container">
//       <AnimatedBackground />
//       <div className="admin-profile-header">
//         <div className="admin-header-background"></div>
//         <div className="admin-profile-info-card">
//           <div className="admin-avatar-section">
//             <img
//               src={employee.profile_picture || avatarUrl}
//               alt={employee.first_name}
//               className="admin-avatar"
//               onError={(e) => {
//                 e.target.src = avatarUrl;
//               }}
//             />
//             <div className="admin-status-indicator"></div>
//           </div>
//           <div className="admin-info-section">
//             <h1 className="admin-employee-name">
//               {employee.first_name} {employee.last_name}
//             </h1>
//             <p className="admin-employee-id">{employee.employee_id || employee.id}</p>
//             <div className="admin-info-grid">
//               <div className="admin-info-item">
//                 <span className="admin-info-label">Department</span>
//                 <span className="admin-info-value">{employee.department || "N/A"}</span>
//               </div>
//               <div className="admin-info-item">
//                 <span className="admin-info-label">Role</span>
//                 <span className="admin-info-value" style={{ textTransform: "capitalize" }}>
//                   {employee.role || "Admin"}
//                 </span>
//               </div>
//               <div className="admin-info-item">
//                 <span className="admin-info-label">Email</span>
//                 <span className="admin-info-value">{employee.email}</span>
//               </div>
//               <div className="admin-info-item">
//                 <span className="admin-info-label">Username</span>
//                 <span className="admin-info-value">{employee.username || "N/A"}</span>
//               </div>
//               <div className="admin-info-item">
//                 <span className="admin-info-label">Phone</span>
//                 <span className="admin-info-value">{employee.phone_number || "N/A"}</span>
//               </div>
//               <div className="admin-info-item">
//                 <span className="admin-info-label">Status</span>
//                 <span className="admin-info-value">
//                   {employee.is_active ? "Active" : "Inactive"}
//                 </span>
//               </div>
//               <div className="admin-info-item">
//                 <span className="admin-info-label">Joined</span>
//                 <span className="admin-info-value">
//                   {formatDate(employee.date_joined)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminProfile;


import React from "react";
import { useAuth } from "../../../AuthContext/AuthContext";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./AdminProfile.css";
import AnimatedBackground from "../../animatedBackground/AnimatedBackground";

const AdminProfile = () => {
  const { user, loading } = useAuth();  // ← use context directly, no extra API call

  if (loading) {
    return (
      <div className="admin-profile-container">
        <AnimatedBackground />
        <LoadingSpinner fullScreen={false} message="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-profile-container">
        <AnimatedBackground />
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No profile information available
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "N/A" : date.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  return (
    <div className="admin-profile-container">
      <AnimatedBackground />
      <div className="admin-profile-header">
        <div className="admin-header-background"></div>
        <div className="admin-profile-info-card">
          <div className="admin-avatar-section">
            <img
              src={user.profile_picture || avatarUrl}
              alt={user.first_name}
              className="admin-avatar"
              onError={(e) => { e.target.src = avatarUrl; }}
            />
            <div className="admin-status-indicator"></div>
          </div>
          <div className="admin-info-section">
            <h1 className="admin-employee-name">
              {user.first_name} {user.last_name}
            </h1>
            <p className="admin-employee-id">{user.employee_id || user.id}</p>
            <div className="admin-info-grid">
              <div className="admin-info-item">
                <span className="admin-info-label">Department</span>
                <span className="admin-info-value">{user.department || "N/A"}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Role</span>
                <span className="admin-info-value" style={{ textTransform: "capitalize" }}>
                  {user.role || "Admin"}
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Email</span>
                <span className="admin-info-value">{user.email}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Username</span>
                <span className="admin-info-value">{user.username || "N/A"}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Phone</span>
                <span className="admin-info-value">{user.phone_number || "N/A"}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Status</span>
                <span className="admin-info-value">
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Joined</span>
                <span className="admin-info-value">{formatDate(user.date_joined)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;