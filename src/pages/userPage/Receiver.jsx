import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Package,
  TicketCheck,
  Monitor,
  ClipboardList,
  AlarmClock,
  RotateCcw,
  Wrench,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import UserDevicesView from "../../components/user/userDevices/UserDevicesView";
import MyTicketsView from "../../components/user/userTicket/MyTicketsView";
import MyDevices from "../../components/user/myDevices/MyDevices";
import RequestHistory from "../../components/user/requestHistory/RequestHistory";
import OverDueItems from "../../components/user/overDueItems/OverDueItems";
import ReportIssue from "../../components/user/reportIssue/ReportIssue";
import RaiseRepairTicket from "../../components/user/raiseRepairTicket/RaiseRepairTicket";
import ReturnDevice from "../../components/user/returnDevice/ReturnDevice";
import AnimatedBackground from "../../components/animatedBackground/AnimatedBackground";
import PopupModal from "../../components/common/PopupModal";
import {
  IndeterminateLoadBar,
  ContentLoadingOverlay,
} from "../../components/common/ContentLoading";
import { inventoryAPI } from "../../services/api";
import { mockDevices, mockAssignments } from "../../assets/data/mockData";
import { useAuth } from "../../AuthContext/AuthContext";
import "./Receiver.css";

const INVENTORY_ASSET_TYPE_MAP = {
  laptop: "laptop",
  pc: "pc",
  mobile: "phone",
  headphone: "headphone",
  connector: "accessories",
};

const normalizeInventoryAssetForUserView = (asset) => {
  const normalizedStatus =
    asset.status === "available"
      ? "available"
      : asset.status === "retired"
        ? "retired"
        : "assigned";

  return {
    id: `inventory-asset-${asset.id}`,
    source_id: asset.id,
    inventory_source: "inventory_asset",
    name: asset.asset_name,
    device_id: asset.serial_number,
    device_type: INVENTORY_ASSET_TYPE_MAP[asset.category] || "other",
    brand: asset.metadata?.brand || asset.category_display || "Inventory",
    model: asset.asset_name,
    serial_number: asset.serial_number,
    status: normalizedStatus,
    status_label: asset.status_display || normalizedStatus,
    condition: asset.condition || "good",
    specifications: asset.metadata || {},
    purchase_date: asset.purchase_date || null,
    notes: asset.remarks || "",
    image_url: "",
    assigned_to_name: asset.assigned_user_name || null,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
  };
};

function Receiver() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // const rawActiveTab = location.pathname.replace("/", "") || "devices";
  const rawActiveTab = location.pathname.split("/")[1] || "devices";
  const activeTab = rawActiveTab;

  const [devices, setDevices] = useState([]);
  const [inventoryCatalog, setInventoryCatalog] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [deviceRequestsLoading, setDeviceRequestsLoading] = useState(true);
  const [deviceRequestsError, setDeviceRequestsError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const previousTicketsLengthRef = useRef(0);
  const previousRequestStatusesRef = useRef(new Map());
  const initializedRequestStatusesRef = useRef(false);
  const userInventoryDevices = useMemo(
    () => [
      ...devices,
      ...inventoryCatalog.map(normalizeInventoryAssetForUserView),
    ],
    [devices, inventoryCatalog],
  );

  const maybeNotifyRequestStatusChanges = (fetchedRequests) => {
    if (!initializedRequestStatusesRef.current) return;

    const previousStatuses = previousRequestStatusesRef.current;
    const changedRequests = fetchedRequests.filter((request) => {
      const previousStatus = previousStatuses.get(request.id);
      // const shouldNotifyStatuses = ["approved", "rejected", "consent_pending"];
      const shouldNotifyStatuses = ["consent_pending", "rejected", "returned"];
      const isNewRequest = !previousStatuses.has(request.id);
      const statusChanged = previousStatus && previousStatus !== request.status;

      return (
        shouldNotifyStatuses.includes(request.status) &&
        (statusChanged || isNewRequest)
      );
    });

    if (!changedRequests.length) return;

    const latestChange = changedRequests[0];
    // const isApproved = latestChange.status === "approved";
    // const isConsentPending = latestChange.status === "consent_pending";
    const deviceLabel =
      latestChange.device_details?.name ||
      `${latestChange.brand || ""} ${latestChange.model || ""}`.trim() ||
      latestChange.device_type ||
      "device request";

    // setPopup({
    //   open: true,
    //   title: isConsentPending
    //     ? "Consent Required"
    //     : isApproved
    //       ? "Request Approved"
    //       : "Request Rejected",
    const isConsentPending = latestChange.status === "consent_pending";
    const isRejected = latestChange.status === "rejected";
    const isReturned = latestChange.status === "returned";
    const isPositiveUpdate = isConsentPending || isReturned;

    setPopup({
      open: true,
      title: isConsentPending
        ? "Consent Required"
        : isReturned
          ? "Device Returned"
          : isRejected
            ? "Request Rejected"
            : "Request Update",
      message:
        changedRequests.length === 1
          ? isConsentPending
            ? `Your ${deviceLabel} is ready. Please complete the consent form.`
            : isReturned
              ? `Your ${deviceLabel} return has been completed.`
              : isRejected
                ? `Your ${deviceLabel} request was rejected.`
                : `Your ${deviceLabel} request status updated.`
          : `${changedRequests.length} request updates were received. Open Request History to review them.`,
      type: isPositiveUpdate ? "success" : isRejected ? "error" : "info",
      actions: [
        {
          label: isConsentPending
            ? "Fill Consent Form"
            : "View Request History",
          onClick: () => {
            navigate("/requesthistory");
            setPopup((prev) => ({ ...prev, open: false }));
          },
        },
      ],
    });
  };

  const loadDashboard = async ({
    background = false,
    notifyRequestChanges = false,
  } = {}) => {
    if (background && document.visibilityState === "hidden") return;

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setDeviceRequestsLoading(true);
      setDeviceRequestsError(null);
      setError(null);
    }

    try {
      const [
        devicesResponse,
        inventoryCatalogResponse,
        assignmentsResponse,
        ticketsResponse,
        requestsResponse,
      ] = await Promise.all([
        inventoryAPI.getDevices(),
        inventoryAPI.getInventoryCatalog(),
        inventoryAPI.getAssignments(),
        inventoryAPI.getMyTickets(),
        inventoryAPI.getMyDeviceRequests(),
      ]);

      const userData = user || null;
      setCurrentUser(userData);

      let fetchedDevices = Array.isArray(devicesResponse.data)
        ? devicesResponse.data
        : devicesResponse.data.results || [];
      if (!fetchedDevices.length) fetchedDevices = mockDevices;
      setDevices(fetchedDevices);

      const fetchedInventoryCatalog = Array.isArray(inventoryCatalogResponse.data)
        ? inventoryCatalogResponse.data
        : inventoryCatalogResponse.data.results || [];
      setInventoryCatalog(fetchedInventoryCatalog);

      let fetchedAssigns = Array.isArray(assignmentsResponse.data)
        ? assignmentsResponse.data
        : assignmentsResponse.data.results || [];
      if (!fetchedAssigns.length) {
        if (userData?.id) {
          fetchedAssigns = mockAssignments
            .filter((a) => String(a.employee_id) === String(userData.id))
            .map((a) => ({
              ...a,
              device: mockDevices.find((d) => d.id === a.device_id) || null,
            }));
        }
        if (!fetchedAssigns.length) {
          fetchedAssigns = mockAssignments.map((a) => ({
            ...a,
            device: mockDevices.find((d) => d.id === a.device_id) || null,
          }));
        }
      }
      setAssignments(fetchedAssigns);

      const fetchedTickets = Array.isArray(ticketsResponse.data)
        ? ticketsResponse.data
        : ticketsResponse.data.results || [];
      setTickets(fetchedTickets);

      if (
        background &&
        fetchedTickets.length > previousTicketsLengthRef.current
      ) {
        const newCount =
          fetchedTickets.length - previousTicketsLengthRef.current;
        setPopup({
          open: true,
          title: "Ticket Update",
          message: `You have ${newCount} new ticket update(s)!`,
          type: "info",
        });
      }
      previousTicketsLengthRef.current = fetchedTickets.length;

      const fetchedRequests = Array.isArray(requestsResponse.data)
        ? requestsResponse.data
        : requestsResponse.data.results || [];

      if (notifyRequestChanges) {
        maybeNotifyRequestStatusChanges(fetchedRequests);
      }

      setDeviceRequests(fetchedRequests);
      previousRequestStatusesRef.current = new Map(
        fetchedRequests.map((request) => [request.id, request.status]),
      );
      initializedRequestStatusesRef.current = true;

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      const msg = err.message || "Failed to fetch data";
      setError(msg);
      if (!background) {
        setDeviceRequestsError(msg);
      }
    } finally {
      setLoading(false);
      setDeviceRequestsLoading(false);
      setRefreshing(false);
    }
  };

  // useEffect(() => {
  //   loadDashboard({ background: false, notifyRequestChanges: true });
  //   const mainInterval = setInterval(
  //     () => loadDashboard({ background: true }),
  //     45000,
  //   );
  //   const approvalInterval = setInterval(
  //     () => loadDashboard({ background: true, notifyRequestChanges: true }),
  //     15000,
  //   );

  //   return () => {
  //     clearInterval(mainInterval);
  //     clearInterval(approvalInterval);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user]);
  useEffect(() => {
    loadDashboard({ background: false, notifyRequestChanges: true });

    const interval = setInterval(() => {
      loadDashboard({ background: true, notifyRequestChanges: true });
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboard({ background: true, notifyRequestChanges: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
          ? `Hi ${payload.full_name || "there"}, your workspace is ready. You can explore devices, tickets, and requests from the tabs above.`
          : `Hi ${payload.full_name || "there"}, you're signed in successfully.`,
        type: "success",
      });
      sessionStorage.removeItem("ims_pending_welcome");
    } catch {
      sessionStorage.removeItem("ims_pending_welcome");
    }
  }, [user]);

  // const getEmployeeForDevice = (deviceId) => {
  //   const assignment = assignments.find(
  //     (a) => a.device?.id === deviceId && a.status === "active",
  //   );
  //   return assignment ? assignment.employee : undefined;
  // };
  const getEmployeeForDevice = (deviceId) => {
    const assignment = assignments.find(
      (a) =>
        (a.device?.id === deviceId || a.device_id === deviceId) &&
        a.status === "active",
    );

    return assignment
      ? assignment.employee ||
          assignment.employee_details || {
            full_name: assignment.employee_name,
            email: assignment.employee_email,
          }
      : undefined;
  };

  const tabs = [
    { id: "devices", label: "Devices", icon: Package },
    { id: "tickets", label: "My Tickets", icon: TicketCheck },
    { id: "mydevices", label: "My Devices", icon: Monitor },
    { id: "returndevice", label: "Return Device", icon: RotateCcw },
    { id: "requesthistory", label: "Request History", icon: ClipboardList },
    { id: "overdue", label: "Return Due", icon: AlarmClock },
    { id: "raiserepairticket", label: "Repair Ticket", icon: Wrench },
  ];

  return (
    <div className="receiver-main-container">
      <IndeterminateLoadBar show={refreshing && !loading} />
      <AnimatedBackground />
      <Navbar />

      <div className="receiver-tabs-container">
        <div className="receiver-tabs-card">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                // onClick={() => navigate(`/${tab.id}`)}
                onClick={() => navigate(tab.id)}
                className={`receiver-tab-button ${
                  activeTab === tab.id ? "active-tab" : "inactive-tab"
                }`}
              >
                <Icon className="receiver-tab-icon" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="receiver-content">
        <ContentLoadingOverlay
          show={loading}
          message="Loading your workspace…"
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
              onClick={() => loadDashboard({ background: false })}
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

        {activeTab === "devices" && (
          <UserDevicesView
            devices={userInventoryDevices}
            userEmail={currentUser?.email}
            getEmployeeForDevice={getEmployeeForDevice}
            onTicketCreated={() => loadDashboard({ background: true })}
          />
        )}

        {activeTab === "tickets" && (
          <MyTicketsView tickets={tickets} devices={devices} />
        )}

        {activeTab === "mydevices" && <MyDevices />}

        {activeTab === "returndevice" && (
          <ReturnDevice
            onReturned={() =>
              loadDashboard({ background: true, notifyRequestChanges: true })
            }
          />
        )}

        {activeTab === "requesthistory" && (
          <RequestHistory
            requests={deviceRequests}
            loading={deviceRequestsLoading}
            error={deviceRequestsError}
            onRequestDevice={() => {
              navigate("/devices");
              setPopup({
                open: true,
                title: "Request a Device",
                message:
                  "Select an available device from the Devices tab and click “Request Device”.",
                type: "info",
              });
            }}
            onRefresh={() => loadDashboard({ background: true })}
          />
        )}

        {activeTab === "overdue" && <OverDueItems />}

        {activeTab === "raiserepairticket" && (
          <RaiseRepairTicket
            onTicketCreated={() => loadDashboard({ background: true })}
          />
        )}
      </div>

      <ReportIssue
        onTicketCreated={() => loadDashboard({ background: true })}
        forceOpen={rawActiveTab === "reportissue"}
      />

      <PopupModal
        open={popup.open}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        actions={popup.actions || []}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />

      <Outlet />
    </div>
  );
}

export default Receiver;
