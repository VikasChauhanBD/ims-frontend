import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";
import "./Login.css";
import AnimatedBackground from "../../components/animatedBackground/AnimatedBackground";
import EmailVerificationPopup from "../../components/common/EmailVerification";

const Login = ({ adminMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const getRedirectPath = (employee) => {
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

    return employee?.role === "admin" ? "/admin/dashboard" : "/devices";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await login({
      login: formData.login,
      password: formData.password,
      admin_only: adminMode,
    });

    if (result.success) {
      // Check if email is verified
      if (!result.data?.email_verified) {
        setPendingEmail(result.data?.email || "");
        setShowEmailVerification(true);
      } else {
        navigate(getRedirectPath(result.data), { replace: true });
      }
    } else {
      setErrors(result.errors);
    }

    setLoading(false);
  };

  const handleEmailVerified = (employee) => {
    setShowEmailVerification(false);
    navigate(getRedirectPath(employee), { replace: true });
  };

  const title = adminMode ? "Admin Access" : "Welcome Back";
  const subtitle = adminMode
    ? "Sign in with your admin account to manage inventory operations"
    : "Sign in to your Inventory Management account";
  const submitLabel = adminMode ? "Admin Sign In" : "Sign In";
  const switchLinkPath = adminMode ? "/login" : "/admin-login";
  const switchLinkLabel = adminMode ? "Employee sign in" : "Admin sign in";
  const signupLinkTarget = (() => {
    const nextPath =
      location.state?.from || new URLSearchParams(location.search).get("next");
    return nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup";
  })();

  return (
    <div className="login-container">
      <AnimatedBackground />
      <div className="login-box">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <svg
              className="logo-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h2 className="login-title">{title}</h2>
          <p className="login-subtitle">{subtitle}</p>
          <div className="login-mode-switch">
            <Link to={switchLinkPath} className="mode-switch-link">
              {switchLinkLabel}
            </Link>
          </div>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {errors.message && (
            <div className="error-container">
              <p className="error-message">{errors.message}</p>
            </div>
          )}

          <div className="form-fields">
            {/* Login identifier */}
            <div className="input-group">
              <label htmlFor="login" className="input-label">
                Email or Username
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg
                    className="field-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.login}
                  onChange={handleChange}
                  className={`input-field ${(errors.login || errors.email) ? "input-error" : ""}`}
                  placeholder="Enter your email or username"
                />
              </div>
              {(errors.login || errors.email) && (
                <p className="field-error">{errors.login || errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg
                    className="field-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${errors.password ? "input-error" : ""}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg
                    className="field-icon toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="form-footer">
            <div className="remember-me">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="checkbox"
              />
              <label htmlFor="remember-me" className="checkbox-label">
                Remember me
              </label>
            </div>

            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <svg
                className="spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="spinner-track"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="spinner-fill"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              submitLabel
            )}
          </button>

          {!adminMode && (
            <div className="signup-prompt">
              <p className="signup-text">
                Don't have an account?{" "}
                <Link to={signupLinkTarget} className="signup-link">
                  Sign up now
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Email Verification Popup */}
      <EmailVerificationPopup
        isOpen={showEmailVerification}
        email={pendingEmail}
        onClose={() => setShowEmailVerification(false)}
        onVerified={handleEmailVerified}
      />
    </div>
  );
};

export default Login;
