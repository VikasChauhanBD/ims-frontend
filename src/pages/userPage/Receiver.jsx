import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Package,
  TicketCheck,
  Monitor,
  ClipboardList,
  AlarmClock,
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
import AnimatedBackground from "../../components/animatedBackground/AnimatedBackground";
import PopupModal from "../../components/common/PopupModal";
import {
  IndeterminateLoadBar,
  ContentLoadingOverlay,
} from "../../components/common/ContentLoading";
import { inventoryAPI, authAPI } from "../../services/api";
import { mockDevices, mockAssignments } from "../../assets/data/mockData";
import "./Receiver.css";

function Receiver() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawActiveTab = location.pathname.replace("/", "") || "devices";
  const activeTab = rawActiveTab === "reportissue" ? "devices" : rawActiveTab;

  const [devices, setDevices] = useState([]);
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

  const maybeNotifyRequestStatusChanges = (fetchedRequests) => {
    if (!initializedRequestStatusesRef.current) return;

    const previousStatuses = previousRequestStatusesRef.current;
    const changedRequests = fetchedRequests.filter((request) => {
      const previousStatus = previousStatuses.get(request.id);
      const shouldNotifyStatuses = ["approved", "rejected", "consent_pending"];
      const isNewRequest = !previousStatuses.has(request.id);
      const statusChanged =
        previousStatus && previousStatus !== request.status;

      return (
        shouldNotifyStatuses.includes(request.status) &&
        (statusChanged || isNewRequest)
      );
    });

    if (!changedRequests.length) return;

    const latestChange = changedRequests[0];
    const isApproved = latestChange.status === "approved";
    const isConsentPending = latestChange.status === "consent_pending";
    const deviceLabel =
      [latestChange.brand, latestChange.model]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      latestChange.device_type ||
      "device request";

    setPopup({
      open: true,
      title: isConsentPending
        ? "Consent Required"
        : isApproved
          ? "Request Approved"
          : "Request Rejected",
      message:
        changedRequests.length === 1
          ? isConsentPending
            ? `Your ${deviceLabel} has been granted. Please fill the consent form for further details.`
            : `Your ${deviceLabel} request was ${latestChange.status}.`
          : `${changedRequests.length} request updates were received. Open Request History to review them.`,
      type: isConsentPending ? "info" : isApproved ? "success" : "error",
      actions: [
        {
          label: isConsentPending ? "Fill Consent Form" : "View Request History",
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
        userResponse,
        devicesResponse,
        assignmentsResponse,
        ticketsResponse,
        requestsResponse,
      ] = await Promise.all([
        authAPI.getCurrentUser(),
        inventoryAPI.getDevices(),
        inventoryAPI.getAssignments(),
        inventoryAPI.getMyTickets(),
        inventoryAPI.getMyDeviceRequests(),
      ]);

      const userData = userResponse.data;
      setCurrentUser(userData);

      let fetchedDevices = Array.isArray(devicesResponse.data)
        ? devicesResponse.data
        : devicesResponse.data.results || [];
      if (!fetchedDevices.length) fetchedDevices = mockDevices;
      setDevices(fetchedDevices);

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

  useEffect(() => {
    loadDashboard({ background: false, notifyRequestChanges: true });
    const mainInterval = setInterval(
      () => loadDashboard({ background: true }),
      30000,
    );
    const approvalInterval = setInterval(
      () => loadDashboard({ background: true, notifyRequestChanges: true }),
      10000,
    );

    return () => {
      clearInterval(mainInterval);
      clearInterval(approvalInterval);
    };
  }, []);

  const getEmployeeForDevice = (deviceId) => {
    const assignment = assignments.find(
      (a) => a.device?.id === deviceId && a.status === "active",
    );
    return assignment ? assignment.employee : undefined;
  };

  const tabs = [
    { id: "devices", label: "Devices", icon: Package },
    { id: "tickets", label: "My Tickets", icon: TicketCheck },
    { id: "mydevices", label: "My Devices", icon: Monitor },
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
                onClick={() => navigate(`/${tab.id}`)}
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
            devices={devices}
            userEmail={currentUser?.email}
            getEmployeeForDevice={getEmployeeForDevice}
            onTicketCreated={() => loadDashboard({ background: true })}
          />
        )}

        {activeTab === "tickets" && (
          <MyTicketsView tickets={tickets} devices={devices} />
        )}

        {activeTab === "mydevices" && <MyDevices />}

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
            onDelete={() => loadDashboard({ background: true })}
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
