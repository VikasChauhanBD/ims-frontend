import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Ticket,
  Database,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Dashboard from "../../components/admin/dashboard/Dashboard";
import DevicesView from "../../components/admin/devices/DevicesView";
import EmployeesView from "../../components/admin/employees/EmployeesView";
import AssignmentsView from "../../components/admin/assignments/AssignmentsView";
import TicketRequestsView from "../../components/admin/ticketRequestsView/TicketRequestsView";
import DeviceRequestsView from "../../components/admin/deviceRequestsView/DeviceRequestsView";
import InventoryDashboard from "../../components/admin/inventoryAssets/InventoryDashboard";
import PopupModal from "../../components/common/PopupModal";
import {
  IndeterminateLoadBar,
  ContentLoadingOverlay,
} from "../../components/common/ContentLoading";
import AnimatedBackground from "../../components/animatedBackground/AnimatedBackground";
import { inventoryAPI, employeeAPI } from "../../services/api";
import { useAuth } from "../../AuthContext/AuthContext";
import {
  mockEmployees,
  mockDevices,
  mockAssignments,
} from "../../assets/data/mockData";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Derive activeTab from the current URL
  const activeTab = location.pathname.split("/admin/")[1] || "dashboard";

  const [devices, setDevices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [inventoryAssets, setInventoryAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    actions: [],
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("ims_pending_welcome");
    if (!raw || !user?.id) return;

    try {
      const payload = JSON.parse(raw);
      if (String(payload.id) !== String(user.id)) return;

      setPopup({
        open: true,
        title: payload.first_login ? "Welcome to IMS" : "Welcome Back",
        message: payload.first_login
          ? `Hi ${payload.full_name || "there"}, your admin workspace is ready. You can review devices, requests, and ticket updates from the tabs above.`
          : `Hi ${payload.full_name || "there"}, you're signed in successfully.`,
        type: "success",
      });
      sessionStorage.removeItem("ims_pending_welcome");
    } catch {
      sessionStorage.removeItem("ims_pending_welcome");
    }
  }, [user]);

  const previousTicketsLengthRef = useRef(0);
  const previousPendingDeviceRequestIdsRef = useRef(new Set());
  const previousConsentSubmittedRef = useRef(new Map());
  const initializedPendingDeviceRequestsRef = useRef(false);

  const maybeNotifyDeviceRequestChanges = (allRequests) => {
    const pendingRequests = allRequests.filter(
      (request) => request.status === "pending",
    );
    const nextPendingIds = new Set(
      pendingRequests.map((request) => request.id),
    );
    const nextConsentMap = new Map(
      allRequests.map((request) => [
        request.id,
        Boolean(
          request.assignment_details?.consent_form_data &&
          Object.keys(request.assignment_details.consent_form_data || {})
            .length,
        ),
      ]),
    );

    if (initializedPendingDeviceRequestsRef.current) {
      const previousPendingIds = previousPendingDeviceRequestIdsRef.current;
      const previousConsentMap = previousConsentSubmittedRef.current;
      const newPendingRequests = pendingRequests.filter(
        (request) => !previousPendingIds.has(request.id),
      );
      const newlySubmittedConsents = allRequests.filter((request) => {
        const hadConsent = previousConsentMap.get(request.id) || false;
        const hasConsentNow = nextConsentMap.get(request.id) || false;
        return (
          !hadConsent && hasConsentNow && request.status === "consent_pending"
        );
      });

      if (newPendingRequests.length) {
        setPopup({
          open: true,
          title: "New Device Request",
          message:
            newPendingRequests.length === 1
              ? "A new device request is waiting for review."
              : `${newPendingRequests.length} new device requests are waiting for review.`,
          type: "info",
          actions: [
            {
              label: "Open Device Requests",
              onClick: () => {
                navigate("/admin/devicerequests");
                setPopup((prev) => ({ ...prev, open: false }));
              },
            },
          ],
        });
      }

      if (newlySubmittedConsents.length) {
        setPopup({
          open: true,
          title: "Consent Form Submitted",
          message:
            newlySubmittedConsents.length === 1
              ? "A consent form was submitted. Please check Device Requests & Undertakings."
              : `${newlySubmittedConsents.length} consent forms were submitted. Please review them.`,
          type: "info",
          actions: [
            {
              label: "Open Device Requests",
              onClick: () => {
                navigate("/admin/devicerequests");
                setPopup((prev) => ({ ...prev, open: false }));
              },
            },
          ],
        });
      }
    }

    previousPendingDeviceRequestIdsRef.current = nextPendingIds;
    previousConsentSubmittedRef.current = nextConsentMap;
    initializedPendingDeviceRequestsRef.current = true;
  };

  const fetchData = async ({
    background = false,
    notifyRequestChanges = false,
  } = {}) => {
    if (background && document.visibilityState === "hidden") return;

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const [
        devicesResponse,
        employeesResponse,
        assignmentsResponse,
        ticketsResponse,
        deviceRequestsResponse,
        inventoryAssetsResponse,
      ] = await Promise.all([
        inventoryAPI.getDevices(),
        employeeAPI.getEmployees(),
        inventoryAPI.getAssignments(),
        inventoryAPI.getTickets(),
        inventoryAPI.getDeviceRequests(),
        inventoryAPI.getInventoryAssets(),
      ]);

      let fetchedDevices = Array.isArray(devicesResponse.data)
        ? devicesResponse.data
        : devicesResponse.data.results || [];
      if (!fetchedDevices.length) fetchedDevices = mockDevices;
      setDevices(fetchedDevices);

      let fetchedEmps = Array.isArray(employeesResponse.data)
        ? employeesResponse.data
        : employeesResponse.data.results || [];
      if (!fetchedEmps.length) fetchedEmps = mockEmployees;
      setEmployees(fetchedEmps);

      let fetchedAssigns = Array.isArray(assignmentsResponse.data)
        ? assignmentsResponse.data
        : assignmentsResponse.data.results || [];
      if (!fetchedAssigns.length) fetchedAssigns = mockAssignments;
      setAssignments(fetchedAssigns);

      const fetchedTickets = Array.isArray(ticketsResponse.data)
        ? ticketsResponse.data
        : ticketsResponse.data.results || [];
      setTickets(fetchedTickets);

      if (
        background &&
        fetchedTickets.length > previousTicketsLengthRef.current
      ) {
        setPopup({
          open: true,
          title: "New Ticket Received",
          message: `New ticket request received! Total: ${fetchedTickets.length}`,
          type: "info",
        });
      }
      previousTicketsLengthRef.current = fetchedTickets.length;

      const fetchedDeviceRequests = Array.isArray(deviceRequestsResponse.data)
        ? deviceRequestsResponse.data
        : deviceRequestsResponse.data.results || [];
      setDeviceRequests(fetchedDeviceRequests);
      if (notifyRequestChanges) {
        maybeNotifyDeviceRequestChanges(fetchedDeviceRequests);
      } else {
        previousPendingDeviceRequestIdsRef.current = new Set(
          fetchedDeviceRequests
            .filter((request) => request.status === "pending")
            .map((request) => request.id),
        );
        previousConsentSubmittedRef.current = new Map(
          fetchedDeviceRequests.map((request) => [
            request.id,
            Boolean(
              request.assignment_details?.consent_form_data &&
              Object.keys(request.assignment_details.consent_form_data || {})
                .length,
            ),
          ]),
        );
        initializedPendingDeviceRequestsRef.current = true;
      }

      let fetchedInventoryAssets = Array.isArray(inventoryAssetsResponse.data)
        ? inventoryAssetsResponse.data
        : inventoryAssetsResponse.data.results || [];
      setInventoryAssets(fetchedInventoryAssets);

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data from backend with a single background poll.
  useEffect(() => {
    fetchData({ background: false, notifyRequestChanges: true });

    const interval = setInterval(() => {
      fetchData({ background: true, notifyRequestChanges: true });
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData({ background: true, notifyRequestChanges: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddDevice = async (device) => {
    try {
      const payload = {
        ...device,
        purchase_date:
          device.purchase_date && String(device.purchase_date).trim()
            ? device.purchase_date
            : null,
        serial_number:
          device.serial_number && String(device.serial_number).trim()
            ? device.serial_number.trim()
            : null,
        image_url:
          device.image_url &&
          !String(device.image_url).startsWith("blob:") &&
          !String(device.image_url).startsWith("data:")
            ? device.image_url
            : "",
      };

      const response = await inventoryAPI.createDevice(payload);
      await fetchData({ background: true });
      setPopup({
        open: true,
        title: "Device Added",
        message: "Device has been successfully added to inventory.",
        type: "success",
      });
      return response.data;
    } catch (err) {
      console.error("Failed to create device:", err);
      setPopup({
        open: true,
        title: "Device Creation Failed",
        message:
          err.response?.data?.detail ||
          JSON.stringify(err.response?.data || {}) ||
          err.message ||
          "Error creating device. Please try again.",
        type: "error",
      });
      throw err;
    }
  };

  const handleEditDevice = async (editedDevice) => {
    try {
      const normalizedPurchaseDate =
        editedDevice.purchase_date && String(editedDevice.purchase_date).trim()
          ? editedDevice.purchase_date
          : null;
      const normalizedSerialNumber =
        editedDevice.serial_number && String(editedDevice.serial_number).trim()
          ? editedDevice.serial_number.trim()
          : null;
      const normalizedImageUrl =
        editedDevice.image_url &&
        !editedDevice.image_url.startsWith("blob:") &&
        !editedDevice.image_url.startsWith("data:")
          ? editedDevice.image_url
          : "";

      // Prepare device data - only include fields the backend expects
      const deviceData = {
        device_id: editedDevice.device_id,
        name:
          editedDevice.name ||
          [editedDevice.brand, editedDevice.model]
            .filter(Boolean)
            .join(" ")
            .trim(),
        device_type: editedDevice.device_type,
        brand: editedDevice.brand,
        model: editedDevice.model,
        serial_number: normalizedSerialNumber,
        purchase_date: normalizedPurchaseDate,
        status: editedDevice.status,
        condition: editedDevice.condition,
        location: editedDevice.location || "",
        notes: editedDevice.notes || "",
      };

      if (normalizedImageUrl) {
        deviceData.image_url = normalizedImageUrl;
      }

      const response = await inventoryAPI.updateDevice(
        editedDevice.id,
        deviceData,
      );

      setPopup({
        open: true,
        title: "Device Updated",
        message: "Device has been successfully updated.",
        type: "success",
      });

      await fetchData({ background: true });
      return response.data;
    } catch (err) {
      console.error("Failed to update device:", err);
      setPopup({
        open: true,
        title: "Device Update Failed",
        message:
          err.response?.data?.detail ||
          JSON.stringify(err.response?.data || {}) ||
          err.message ||
          "Error updating device. Please try again.",
        type: "error",
      });
      throw err;
    }
  };

  const handleRevokeAssignment = async (assignmentId) => {
    try {
      await inventoryAPI.revokeAssignment(
        assignmentId,
        "Assignment revoked and device returned by admin.",
      );
      await fetchData({ background: true });
      setPopup({
        open: true,
        title: "Assignment Revoked",
        message:
          "The assignment was revoked and the device was returned to inventory.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to revoke assignment:", err);
      setPopup({
        open: true,
        title: "Revoke Failed",
        message:
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Unable to revoke the assignment right now.",
        type: "error",
      });
      throw err;
    }
  };

  const stats = useMemo(() => {
    const totalDevices = devices.length;
    const assignedDevices = devices.filter(
      (d) => d.status === "assigned",
    ).length;
    const availableDevices = devices.filter(
      (d) => d.status === "available",
    ).length;
    const maintenanceDevices = devices.filter(
      (d) => d.status === "maintenance",
    ).length;
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(
      (e) => e.is_active === true,
    ).length;
    const totalPhones = devices.filter((d) => d.device_type === "phone").length;
    const totalLaptops = devices.filter(
      (d) => d.device_type === "laptop",
    ).length;

    return {
      totalDevices,
      assignedDevices,
      availableDevices,
      maintenanceDevices,
      totalEmployees,
      activeEmployees,
      totalPhones,
      totalLaptops,
    };
  }, [devices, employees]);

  const assignmentsWithDetails = useMemo(() => {
    return assignments.map((assignment) => ({
      ...assignment,
      device: devices.find(
        (d) => d.id === assignment.device_id || d.id === assignment.device?.id,
      ),
      employee: employees.find(
        (e) => e.id === assignment.employee_id || e.id === assignment.employee,
      ),
    }));
  }, [assignments, devices, employees]);

  const getEmployeeForDevice = (deviceId) => {
    const assignment = assignments.find(
      (a) =>
        (a.device_id === deviceId || a.device?.id === deviceId) &&
        a.status === "active",
    );
    return assignment
      ? employees.find(
          (e) =>
            e.id === assignment.employee_id || e.id === assignment.employee,
        )
      : undefined;
  };

  const pendingTicketCount = useMemo(
    () => tickets.filter((ticket) => ticket.status === "pending").length,
    [tickets],
  );

  const pendingDeviceRequestCount = useMemo(
    () =>
      deviceRequests.filter((request) => request.status === "pending").length,
    [deviceRequests],
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "devices", label: "Devices", icon: Package },
    { id: "inventoryassets", label: "Inventory Assets", icon: Database },
    { id: "employees", label: "Employees", icon: Users },
    { id: "assignments", label: "Assignments", icon: FileText },
    {
      id: "ticketrequests",
      label: "Ticket Requests",
      icon: Ticket,
      badge: pendingTicketCount,
    },
    {
      id: "devicerequests",
      label: "Device Requests",
      icon: Ticket,
      badge: pendingDeviceRequestCount,
    },
  ];

  return (
    <div className="admin-main-container">
      <IndeterminateLoadBar show={refreshing && !loading} />
      <AnimatedBackground />
      <Navbar />

      {/* Tabs */}
      <div className="admin-tabs-container">
        <div className="admin-tabs-card">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/admin/${tab.id}`)}
                className={`admin-tab-button ${
                  activeTab === tab.id ? "active-tab" : "inactive-tab"
                }`}
              >
                <Icon className="admin-tab-icon" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="admin-tab-badge">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <ContentLoadingOverlay
          show={loading}
          message="Loading admin dashboard…"
          variant="dashboard"
        />
        {error && !loading && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: 16,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#b91c1c",
            }}
          >
            {error}
            <button
              type="button"
              onClick={() => fetchData({ background: false })}
              style={{
                marginLeft: 12,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}
        {activeTab === "dashboard" && <Dashboard stats={stats} />}

        {activeTab === "devices" && (
          <DevicesView
            devices={devices}
            getEmployeeForDevice={getEmployeeForDevice}
            onAddDevice={handleAddDevice}
            onEditDevice={handleEditDevice}
          />
        )}

        {activeTab === "inventoryassets" && (
          <InventoryDashboard
            assets={inventoryAssets}
            onSendMail={async (id) => {
              try {
                await inventoryAPI.sendClaimMail(id);
                fetchData({ background: true });
              } catch (err) {
                throw err;
              }
            }}
            onUpdateEmail={async (id, email) => {
              try {
                await inventoryAPI.updateAssignedEmail(id, {
                  assigned_email: email,
                });
                fetchData({ background: true });
              } catch (err) {
                throw err;
              }
            }}
            loading={loading}
          />
        )}

        {activeTab === "employees" && (
          <EmployeesView
            employees={employees}
            onRefresh={() => fetchData({ background: true })}
          />
        )}

        {activeTab === "assignments" && (
          <AssignmentsView
            assignments={assignmentsWithDetails}
            onReturnDevice={handleRevokeAssignment}
          />
        )}

        {activeTab === "ticketrequests" && (
          <TicketRequestsView
            tickets={tickets}
            setTickets={setTickets}
            devices={devices}
            employees={employees}
            onRefresh={() => fetchData({ background: true })}
          />
        )}

        {activeTab === "devicerequests" && (
          <DeviceRequestsView
            requests={deviceRequests}
            setRequests={setDeviceRequests}
            employees={employees}
            onRefresh={() => fetchData({ background: true })}
          />
        )}
      </div>

      <PopupModal
        open={popup.open}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        actions={popup.actions || []}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />

      {/* Required by React Router for nested routes */}
      <Outlet />
    </div>
  );
}

export default Admin;
