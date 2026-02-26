import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext/AuthContext";
import Login from "./pages/loginPage/Login";
import Signup from "./pages/signupPage/Signup";
import ForgotPassword from "./pages/forgetpasswordPage/ForgotPassword";
import ResetPassword from "./pages/resetPasswordPage/ResetPassword";
import Admin from "./pages/adminPage/Admin";
import Receiver from "./pages/userPage/Receiver";
import EmployeeProfile from "./components/user/profile/EmployeeProfile";
import AdminProfile from "./components/admin/profile/AdminProfile";
import "./App.css";

// Protected Route
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== "admin") return <Navigate to="/devices" />;
  return children;
}

// User-only Route (authenticated, non-admin users only)
function UserOnlyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role === "admin") return <Navigate to="/admin/profile" />;
  return children;
}

// Admin-only Route (authenticated, admin users only)
function AdminOnlyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/profile" />;
  return children;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !isAuthenticated ? children : <Navigate to="/devices" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/profile"
            element={
              <UserOnlyRoute>
                <EmployeeProfile />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <AdminOnlyRoute>
                <AdminProfile />
              </AdminOnlyRoute>
            }
          />

          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Receiver />
              </ProtectedRoute>
            }
          >
            <Route path="devices" element={null} />
            <Route path="tickets" element={null} />
            <Route path="mydevices" element={null} />
            <Route path="requesthistory" element={null} />
            <Route path="overdue" element={null} />
            <Route path="reportissue" element={null} />
            <Route path="raiserepairticket" element={null} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={null} />
            <Route path="devices" element={null} />
            <Route path="employees" element={null} />
            <Route path="assignments" element={null} />
            <Route path="ticketrequests" element={null} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
