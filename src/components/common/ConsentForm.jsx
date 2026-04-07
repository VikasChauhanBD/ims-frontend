import React, { useState, useRef } from "react";
import { X, Upload, CheckCircle } from "lucide-react";
import { uploadImage, validateImageFile } from "../../services/imageUpload";
import "./ConsentForm.css";

export default function ConsentForm({
  assignment,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employee_name: assignment?.employee_details?.full_name || "",
    employee_id: assignment?.employee_details?.employee_id || "",
    device_name: assignment?.device_details?.name || "",
    device_id: assignment?.device_details?.device_id || "",
    received_date: new Date().toISOString().split("T")[0],
    condition: "excellent",
    accessories: "",
    signature_text: "",
    signature_image: null,
  });

  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const signatureCanvasRef = useRef(null);

  const handleInputChange = (e) => {
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({
        ...prev,
        image: validation.error,
      }));
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setUploadedImages((prev) => [...prev, imageUrl]);
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        image: error.message || "Failed to upload image",
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSignature = () => {
    const text = prompt("Please sign with your full name:");
    if (text) {
      setFormData((prev) => ({
        ...prev,
        signature_text: text,
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.condition) newErrors.condition = "Condition is required";
      if (!formData.received_date) newErrors.received_date = "Receipt date is required";
    } else if (step === 2) {
      if (!formData.signature_text && !formData.signature_image) {
        newErrors.signature = "Signature is required";
      }
    } else if (step === 3) {
      if (uploadedImages.length === 0) {
        newErrors.photos = "At least one photo is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const consentData = {
      consent_form_data: {
        employee_name: formData.employee_name,
        employee_id: formData.employee_id,
        device_name: formData.device_name,
        device_id: formData.device_id,
        received_date: formData.received_date,
        condition: formData.condition,
        accessories: formData.accessories,
        signature: formData.signature_text,
      },
      consent_images: uploadedImages,
    };

    await onSubmit(consentData);
    onClose();
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal-container">
        <div className="consent-modal-header">
          <h2>Device Undertaking & Consent Form</h2>
          <button
            onClick={onClose}
            className="consent-close-btn"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="consent-steps">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`consent-step ${
                currentStep >= step ? "active" : ""
              } ${currentStep === step ? "current" : ""}`}
            >
              <div className="consent-step-number">{step}</div>
              <div className="consent-step-label">
                {step === 1 && "Device Details"}
                {step === 2 && "Signature"}
                {step === 3 && "Photo Verification"}
              </div>
            </div>
          ))}
        </div>

        <div className="consent-modal-body">
          {/* Step 1: Device Details */}
          {currentStep === 1 && (
            <div className="consent-step-content">
              <h3>Device Receipt & Condition</h3>

              <div className="consent-form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  name="employee_name"
                  value={formData.employee_name}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="consent-form-row">
                <div className="consent-form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    disabled
                    className="input-disabled"
                  />
                </div>
                <div className="consent-form-group">
                  <label>Receipt Date</label>
                  <input
                    type="date"
                    name="received_date"
                    value={formData.received_date}
                    onChange={handleInputChange}
                    className={errors.received_date ? "input-error" : ""}
                  />
                  {errors.received_date && (
                    <span className="field-error">{errors.received_date}</span>
                  )}
                </div>
              </div>

              <div className="consent-form-row">
                <div className="consent-form-group">
                  <label>Device Name</label>
                  <input
                    type="text"
                    name="device_name"
                    value={formData.device_name}
                    disabled
                    className="input-disabled"
                  />
                </div>
                <div className="consent-form-group">
                  <label>Device ID</label>
                  <input
                    type="text"
                    name="device_id"
                    value={formData.device_id}
                    disabled
                    className="input-disabled"
                  />
                </div>
              </div>

              <div className="consent-form-group">
                <label>Device Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={errors.condition ? "input-error" : ""}
                >
                  <option value="">Select condition...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
                {errors.condition && (
                  <span className="field-error">{errors.condition}</span>
                )}
              </div>

              <div className="consent-form-group">
                <label>Accessories & Additional Items</label>
                <textarea
                  name="accessories"
                  value={formData.accessories}
                  onChange={handleInputChange}
                  placeholder="List any accessories included (charger, cable, bag, etc.)"
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* Step 2: Signature */}
          {currentStep === 2 && (
            <div className="consent-step-content">
              <h3>Digital Signature</h3>

              <div className="consent-signature-section">
                <p>
                  I hereby acknowledge receipt of the above device and confirm
                  that:
                </p>
                <ul className="consent-acknowledgement">
                  <li>
                    I have received the device in the condition mentioned above
                  </li>
                  <li>I will use the device only for official purposes</li>
                  <li>
                    I am responsible for the safekeeping and security of the
                    device
                  </li>
                  <li>
                    I will report any damage or loss immediately to the admin
                  </li>
                  <li>I will return the device as requested by the company</li>
                </ul>
              </div>

              <div className="consent-form-group">
                <label>Your Signature (Full Name) *</label>
                <div className="signature-input-group">
                  <input
                    type="text"
                    name="signature_text"
                    value={formData.signature_text}
                    onChange={handleInputChange}
                    placeholder="Type your full name as signature"
                    className={errors.signature ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="signature-btn"
                    onClick={handleSignature}
                  >
                    Verify
                  </button>
                </div>
                {formData.signature_text && (
                  <div className="signature-preview">
                    <p style={{ fontStyle: "italic", color: "#666" }}>
                      {formData.signature_text}
                    </p>
                  </div>
                )}
                {errors.signature && (
                  <span className="field-error">{errors.signature}</span>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Photo Verification */}
          {currentStep === 3 && (
            <div className="consent-step-content">
              <h3>Photo Verification</h3>
              <p className="consent-info">
                Please upload photos of the device condition for verification
              </p>

              <div className="consent-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={24} />
                  <span>
                    {uploading
                      ? "Uploading..."
                      : "Click to upload or drag & drop"}
                  </span>
                </button>
              </div>

              {errors.photos && (
                <span className="field-error">{errors.photos}</span>
              )}

              {errors.image && (
                <span className="field-error">{errors.image}</span>
              )}

              {uploadedImages.length > 0 && (
                <div className="consent-images-preview">
                  <h4>Uploaded Photos ({uploadedImages.length})</h4>
                  <div className="images-grid">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="image-item">
                        <img src={image} alt={`Upload ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {currentStep === 3 && uploadedImages.length > 0 && (
            <div className="consent-summary">
              <h4>Form Summary</h4>
              <div className="summary-row">
                <span>Employee:</span>
                <strong>{formData.employee_name}</strong>
              </div>
              <div className="summary-row">
                <span>Device:</span>
                <strong>{formData.device_name}</strong>
              </div>
              <div className="summary-row">
                <span>Condition:</span>
                <strong className="text-capitalize">
                  {formData.condition}
                </strong>
              </div>
              <div className="summary-row">
                <span>Photos:</span>
                <strong>{uploadedImages.length} uploaded</strong>
              </div>
            </div>
          )}
        </div>

        <div className="consent-modal-footer">
          {currentStep > 1 && (
            <button
              className="btn-secondary"
              onClick={handlePrev}
              disabled={isLoading}
            >
              Previous
            </button>
          )}

          {currentStep < 3 ? (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
            </button>
          ) : (
            <button
              className="btn-primary btn-submit"
              onClick={handleSubmit}
              disabled={isLoading || uploadedImages.length === 0}
            >
              {isLoading ? "Submitting..." : "Submit Consent Form"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
