import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/api";
import "./EmailVerification.css";

const EmailVerificationPopup = ({ isOpen, email, onClose, onVerified }) => {
  const [step, setStep] = useState("otp"); // otp, password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    setLoading(true);
    setErrors({});
    try {
      await authAPI.sendOTP(email);
      setMessage("OTP sent to your email");
      setTimer(300); // 5 minutes
    } catch (error) {
      setErrors({ general: error.response?.data?.error || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!otp) {
      setErrors({ otp: "OTP is required" });
      setLoading(false);
      return;
    }

    try {
      await authAPI.verifyOTP(email, otp);
      setStep("password");
      setOtp("");
      setMessage("OTP verified! Now create a new password");
    } catch (error) {
      setErrors({
        otp: error.response?.data?.detail || error.response?.data?.error || "Invalid OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!password || !confirmPassword) {
      setErrors({ password: "All fields are required" });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.changePasswordAfterOTP(
        email,
        otp,
        password,
        confirmPassword
      );
      
      // Store tokens
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);

      setMessage("Password changed successfully!");
      setTimeout(() => {
        onVerified(response.data.employee);
      }, 1000);
    } catch (error) {
      setErrors({
        password:
          error.response?.data?.detail ||
          error.response?.data?.new_password?.[0] ||
          "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="email-verification-overlay">
      <div className="email-verification-popup">
        <div className="verification-header">
          <h2>Email Verification</h2>
          <p>Verify your email to complete registration</p>
        </div>

        <div className="verification-body">
          <div className="email-display">
            <svg
              className="email-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="email-address">{email}</span>
          </div>

          {step === "otp" ? (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    if (errors.otp) setErrors({ ...errors, otp: "" });
                  }}
                  disabled={loading}
                  className={errors.otp ? "error" : ""}
                />
                {errors.otp && <span className="error-message">{errors.otp}</span>}
              </div>

              <button
                type="button"
                className="btn-resend"
                onClick={handleSendOTP}
                disabled={loading || timer > 0}
              >
                {timer > 0 ? `Resend in ${formatTimer(timer)}` : "Send OTP"}
              </button>

              <button
                type="submit"
                className="btn-verify"
                disabled={loading || !otp || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  disabled={loading}
                  className={errors.password ? "error" : ""}
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: "" });
                  }}
                  disabled={loading}
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn-verify"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? "Setting Password..." : "Complete Setup"}
              </button>
            </form>
          )}

          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}
          {message && (
            <div className="success-banner">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPopup;
