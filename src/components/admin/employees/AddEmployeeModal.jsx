import React, { useState } from "react";
import { X } from "lucide-react";
import { employeeAPI } from "../../../services/api";
import { handleAPIError } from "../../../services/api";
import "./AddEmployeeModal.css";

export default function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
    position: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage("");

    try {
      // Prepare data for API - exclude confirm_password
      const { confirm_password, ...submitData } = formData;
      
      const response = await employeeAPI.createEmployee(submitData);
      
      setSuccessMessage("Employee created successfully!");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        department: "",
        position: "",
        password: "",
        confirm_password: "",
      });

      // Call callback to refresh employee list
      if (onEmployeeAdded) {
        onEmployeeAdded();
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const apiErrors = handleAPIError(err);
      if (apiErrors.message) {
        setErrors({ submit: apiErrors.message });
      } else {
        setErrors({ ...apiErrors });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Employee</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? "input-error" : ""}
                placeholder="John"
              />
              {errors.first_name && (
                <span className="field-error">{errors.first_name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? "input-error" : ""}
                placeholder="Doe"
              />
              {errors.last_name && (
                <span className="field-error">{errors.last_name}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              placeholder="john.doe@company.com"
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={errors.department ? "input-error" : ""}
                placeholder="Engineering"
              />
              {errors.department && (
                <span className="field-error">{errors.department}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={errors.position ? "input-error" : ""}
                placeholder="Senior Developer"
              />
              {errors.position && (
                <span className="field-error">{errors.position}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder="Enter password"
              />
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password *</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={errors.confirm_password ? "input-error" : ""}
                placeholder="Confirm password"
              />
              {errors.confirm_password && (
                <span className="field-error">{errors.confirm_password}</span>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
