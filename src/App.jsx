import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext/AuthContext";
import Login from "./pages/loginPage/Login";
import Signup from "./pages/signupPage/Signup";
import ForgotPassword from "./pages/forgetpasswordPage/ForgotPassword";
import ResetPassword from "./pages/resetPasswordPage/ResetPassword";
import Admin from "./pages/adminPage/Admin";
import Receiver from "./pages/userPage/Receiver";
import EmployeeProfile from "./components/user/profile/EmployeeProfile";
import AdminProfile from "./components/admin/profile/AdminProfile";
import AssignmentUndertaking from "./components/user/assignmentUndertaking/AssignmentUndertaking";
import MyInventoryPage from "./pages/userPage/MyInventoryPage";
import AssignedInventoryPage from "./pages/userPage/AssignedInventoryPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";

// Protected Route
// function ProtectedRoute({ children, adminOnly = false }) {
//   const { isAuthenticated, loading, user } = useAuth();
//   if (loading) return <LoadingSpinner fullScreen={true} message="Authenticating..." />;
//   if (!isAuthenticated) {
//     return <Navigate to={adminOnly ? "/admin-login" : "/login"} />;
//   }
//   // if route requires admin and user is not admin, send to user dashboard
//   if (adminOnly && user?.role !== "admin") return <Navigate to="/devices" />;
//   // if route is open but user is admin, redirect them to admin panel
//   if (!adminOnly && user?.role === "admin") {
//     return <Navigate to="/admin/dashboard" replace />;
//   }
//   return children;
// }

const getRequestedPath = (location) => {
  const nextFromState = location.state?.from;
  const nextFromQuery = new URLSearchParams(location.search).get("next");
  const nextPath = nextFromState || nextFromQuery;

  if (
    nextPath &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("//") &&
    !nextPath.startsWith("/login") &&
    !nextPath.startsWith("/signup") &&
    !nextPath.startsWith("/admin-login")
  ) {
    return nextPath;
  }

  return null;
};

const buildAuthRedirect = (location, authPath) => {
  const from = `${location.pathname}${location.search}`;
  const next = encodeURIComponent(from);
  return {
    pathname: authPath,
    search: `?next=${next}`,
  };
};

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth(); // ✅ FIX
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={buildAuthRedirect(location, adminOnly ? "/admin-login" : "/login")}
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/devices" />;
  }

  return children;
}

// User-only Route (authenticated, non-admin users only)
function UserOnlyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  if (loading)
    return <LoadingSpinner fullScreen={true} message="Authenticating..." />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to={buildAuthRedirect(location, "/login")}
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }
  if (user?.role === "admin") return <Navigate to="/admin/profile" />;
  return children;
}

// Admin-only Route (authenticated, admin users only)
function AdminOnlyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  if (loading)
    return <LoadingSpinner fullScreen={true} message="Authenticating..." />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to={buildAuthRedirect(location, "/admin-login")}
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }
  if (user?.role !== "admin") return <Navigate to="/profile" />;
  return children;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen message="Authenticating..." />;

  if (!isAuthenticated) return children;

  const requestedPath = getRequestedPath(location);
  if (requestedPath) {
    return <Navigate to={requestedPath} replace />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/devices" replace />;
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
            path="/admin-login"
            element={
              <PublicRoute>
                <Login adminMode />
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
            path="/consent"
            element={
              <UserOnlyRoute>
                <AssignmentUndertaking />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/my-inventory"
            element={
              <UserOnlyRoute>
                <MyInventoryPage />
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
            <Route path="returndevice" element={null} />
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
            <Route path="inventoryassets" element={null} />
            <Route path="employees" element={null} />
            <Route path="assignments" element={null} />
            <Route path="ticketrequests" element={null} />
            <Route path="approvals" element={null} />
            <Route path="return-device" element={null} />
            <Route path="devicerequests" element={null} />
            <Route
              path="assigned-inventory"
              element={<AssignedInventoryPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
