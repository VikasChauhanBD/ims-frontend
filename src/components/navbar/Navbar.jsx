import { Package, LogOut, User } from "lucide-react";
import { useAuth } from "../../AuthContext/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const profilePath = user?.role === "admin" ? "/admin/profile" : "/profile";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LEFT SIDE - LOGO */}
        <div className="navbar-logo">
          <div className="logo-icon">
            <Package className="logo-package" />
          </div>
          <div className="logo-text">
            <h1 className="logo-title">Inventory Management System</h1>
            <p className="logo-subtitle">Track & Manage Company Assets</p>
          </div>
        </div>

        {/* RIGHT SIDE - USER + LOGOUT */}
        <div className="navbar-actions">
          <NavLink to={profilePath} className="profile-link">
            <div className="user-info">
              <User size={20} />
              <span>{user?.full_name || user?.email}</span>
              <span className="user-role">({user?.role})</span>
            </div>
          </NavLink>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
