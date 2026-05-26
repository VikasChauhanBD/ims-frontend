import React, { useEffect, useState } from "react";
import { CalendarClock, PackageCheck, RotateCcw } from "lucide-react";
import { inventoryAPI } from "../../../services/api";
import { SectionSkeleton } from "../../common/SkeletonView";
import PopupModal from "../../common/PopupModal";
import "./ReturnDevice.css";

const buildDeviceName = (device = {}) =>
  [device.brand, device.model].filter(Boolean).join(" ").trim() ||
  device.name ||
  "Assigned device";

export default function ReturnDevice({ onReturned }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [remarksById, setRemarksById] = useState({});
  const [reasonById, setReasonById] = useState({});
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getMyAssignments();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setAssignments(
        data.filter((assignment) => assignment.status === "active"),
      );
    } catch (err) {
      console.error("Failed to load returnable devices:", err);
      setPopup({
        open: true,
        title: "Unable to Load Devices",
        message:
          err.response?.data?.detail ||
          err.message ||
          "Could not load your returnable devices.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnDevice = async (assignment) => {
    const device = assignment.device_details || {};
    const today = new Date().toISOString().split("T")[0];

    const returnReason = reasonById[assignment.id] || "";
    if (!returnReason.trim()) {
      setPopup({
        open: true,
        title: "Please Provide Reason",
        message: "Please provide a reason for returning this device.",
        type: "warning",
      });
      return;
    }

    try {
      setSubmittingId(assignment.id);
      await inventoryAPI.submitReturnForm(assignment.id, {
        return_form_data: {
          return_date: today,
          condition: device.condition || "good",
          accessories: "",
          remarks: remarksById[assignment.id] || "",
        },
        return_reason: returnReason,
        return_images: [],
      });

      setAssignments((prev) =>
        prev.filter((item) => item.id !== assignment.id),
      );

      setPopup({
        open: true,
        title: "Return Request Submitted",
        message:
          "Your device return request has been submitted successfully. The admin will review your request and send you an acceptance or rejection email.",
        type: "success",
      });

      if (onReturned) {
        await onReturned();
      }
    } catch (err) {
      console.error("Failed to submit return:", err);
      setPopup({
        open: true,
        title: "Return Failed",
        message:
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Unable to submit the return right now.",
        type: "error",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <SectionSkeleton lines={4} cards={2} />;
  }

  return (
    <>
      <div className="return-device-page">
        <div className="return-device-header">
          <div>
            <h2>Return Device</h2>
            <p>
              Submit a device return request. The admin will review your request
              and approve or reject it.
            </p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="return-device-empty">
            <RotateCcw className="return-device-empty-icon" />
            <h3>No active devices to return</h3>
            <p>Any active company device assigned to you will appear here.</p>
          </div>
        ) : (
          <div className="return-device-grid">
            {assignments.map((assignment) => {
              const device = assignment.device_details || {};
              const isSubmitting = submittingId === assignment.id;

              return (
                <div key={assignment.id} className="return-device-card">
                  <div className="return-device-card-top">
                    <span className="return-device-type">
                      {device.device_type || "device"}
                    </span>
                    <span className="return-device-status">Active</span>
                  </div>

                  <h3>{buildDeviceName(device)}</h3>

                  <div className="return-device-meta">
                    <div>
                      <PackageCheck size={16} />
                      <span>{device.device_id || "No device id"}</span>
                    </div>
                    <div>
                      <CalendarClock size={16} />
                      <span>
                        Assigned{" "}
                        {assignment.assigned_date
                          ? new Date(
                              assignment.assigned_date,
                            ).toLocaleDateString()
                          : "recently"}
                      </span>
                    </div>
                  </div>

                  <div className="return-device-form-section">
                    <label className="return-device-label">
                      <span>Reason for Return *</span>
                      <textarea
                        className="return-device-reason"
                        placeholder="Please explain why you want to return this device"
                        value={reasonById[assignment.id] || ""}
                        onChange={(event) =>
                          setReasonById((prev) => ({
                            ...prev,
                            [assignment.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="return-device-form-section">
                    <label className="return-device-label">
                      <span>Device Condition & Remarks</span>
                      <textarea
                        className="return-device-remarks"
                        placeholder="Optional remarks about the device condition"
                        value={remarksById[assignment.id] || ""}
                        onChange={(event) =>
                          setRemarksById((prev) => ({
                            ...prev,
                            [assignment.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="return-device-btn"
                    onClick={() => handleReturnDevice(assignment)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting Return..." : "Return Device"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PopupModal
        open={popup.open}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
