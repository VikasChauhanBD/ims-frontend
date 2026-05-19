import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  const acknowledgementItems = [
    "I have received the device in the condition mentioned above.",
    "I will use the device only for official purposes.",
    "I am responsible for the safekeeping and security of the device.",
    "I will report any damage or loss immediately to the admin.",
    "I will return the device as requested by the company.",
  ];

  const employeeName =
    assignment?.employee_details?.full_name ||
    assignment?.employee?.full_name ||
    assignment?.employee_name ||
    "";
  const employeeId =
    assignment?.employee_details?.employee_id ||
    assignment?.employee?.employee_id ||
    assignment?.employee_id ||
    "";
  const deviceName =
    assignment?.device_details?.name ||
    assignment?.device?.name ||
    [assignment?.device_details?.brand, assignment?.device_details?.model]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "";
  const deviceId =
    assignment?.device_details?.device_id ||
    assignment?.device?.device_id ||
    assignment?.device_id ||
    "";
  const cycleImages = Array.isArray(assignment?.cycle_images)
    ? assignment.cycle_images
    : [];

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employee_name: employeeName,
    employee_id: employeeId,
    device_name: deviceName,
    device_id: deviceId,
    received_date: new Date().toISOString().split("T")[0],
    condition: "excellent",
    accessories: "",
  });

  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [ackChecks, setAckChecks] = useState(
    acknowledgementItems.map(() => false),
  );
  const [responsibilityChecked, setResponsibilityChecked] = useState(false);
  const fileInputRef = useRef(null);
  const signatureCanvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !assignment) return;
    setCurrentStep(1);
    setErrors({});
    setUploadedImages([]);
    setUploading(false);
    setAckChecks(acknowledgementItems.map(() => false));
    setResponsibilityChecked(false);
    setFormData({
      employee_name:
        assignment?.employee_details?.full_name ||
        assignment?.employee?.full_name ||
        assignment?.employee_name ||
        "",
      employee_id:
        assignment?.employee_details?.employee_id ||
        assignment?.employee?.employee_id ||
        assignment?.employee_id ||
        "",
      device_name:
        assignment?.device_details?.name ||
        assignment?.device?.name ||
        [
          assignment?.device_details?.brand,
          assignment?.device_details?.model,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        "",
      device_id:
        assignment?.device_details?.device_id ||
        assignment?.device?.device_id ||
        assignment?.device_id ||
        "",
      received_date: new Date().toISOString().split("T")[0],
      condition: "excellent",
      accessories: "",
    });
  }, [assignment, isOpen]);

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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.condition) newErrors.condition = "Condition is required";
      if (!formData.received_date) newErrors.received_date = "Receipt date is required";
    } else if (step === 2) {
      const allAcksChecked = ackChecks.every(Boolean);
      if (!allAcksChecked) {
        newErrors.acknowledgements = "Please tick all acknowledgements to continue";
      }
      if (!responsibilityChecked) {
        newErrors.responsibility =
          "Please confirm responsibility acknowledgement to continue";
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
        acknowledgements: acknowledgementItems.map((text, idx) => ({
          text,
          accepted: Boolean(ackChecks[idx]),
        })),
        responsibility_acknowledged: Boolean(responsibilityChecked),
      },
      consent_images: uploadedImages,
    };

    await onSubmit(consentData);
    onClose();
  };

  if (!isOpen || !assignment) return null;

  const modal = (
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

              {cycleImages.length > 0 && (
                <div className="consent-reference-images">
                  <div className="consent-reference-head">
                    <h4>Latest device images</h4>
                    <p>
                      Review the admin-shared device photos before confirming the
                      condition below.
                    </p>
                  </div>
                  <div className="consent-reference-grid">
                    {cycleImages.map((imageUrl, index) => (
                      <a
                        key={`${assignment?.id || "assignment"}-${index}`}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="consent-reference-card"
                      >
                        <img src={imageUrl} alt={`Reference ${index + 1}`} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
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
                <ol className="consent-acknowledgement-list">
                  {acknowledgementItems.map((text, idx) => (
                    <li key={idx} className="consent-acknowledgement-item">
                      <label className="consent-acknowledgement-label">
                        <input
                          type="checkbox"
                          checked={ackChecks[idx]}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setAckChecks((prev) =>
                              prev.map((v, i) => (i === idx ? checked : v)),
                            );
                            if (errors.acknowledgements) {
                              setErrors((prev) => ({
                                ...prev,
                                acknowledgements: "",
                              }));
                            }
                          }}
                        />
                        <span>{text}</span>
                      </label>
                    </li>
                  ))}
                </ol>

                <div className="consent-responsibility">
                  <label className="consent-acknowledgement-label consent-responsibility-label">
                    <input
                      type="checkbox"
                      checked={responsibilityChecked}
                      onChange={(e) => {
                        setResponsibilityChecked(e.target.checked);
                        if (errors.responsibility) {
                          setErrors((prev) => ({ ...prev, responsibility: "" }));
                        }
                      }}
                    />
                    <span>
                      <strong>
                        I take full responsibility for this device. If it is
                        damaged, lost, or broken, I will bear the cost and
                        consequences as per company policy.
                      </strong>
                    </span>
                  </label>
                </div>

                {errors.acknowledgements && (
                  <span className="field-error">{errors.acknowledgements}</span>
                )}
                {errors.responsibility && (
                  <span className="field-error">{errors.responsibility}</span>
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

  // Render in a portal to avoid parent stacking-context issues (e.g. transforms).
  if (typeof document !== "undefined") {
    return createPortal(modal, document.body);
  }

  return modal;
}
