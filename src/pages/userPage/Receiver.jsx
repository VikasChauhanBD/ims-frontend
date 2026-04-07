import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Package,
  TicketCheck,
  Monitor,
  ClipboardList,
  AlarmClock,
  AlertCircle,
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
import { inventoryAPI, authAPI } from "../../services/api";
import { mockDevices, mockAssignments } from "../../assets/data/mockData";
import "./Receiver.css";

function Receiver() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive activeTab from the flat URL path e.g. /devices → "devices"
  const activeTab = location.pathname.replace("/", "") || "devices";

  const [devices, setDevices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  // Fetch data from backend - optimized polling with longer intervals
  useEffect(() => {
    fetchData();
    // Use longer intervals for better performance: 30 seconds for general data
    const mainInterval = setInterval(fetchData, 30000);
    // Faster polling for critical updates like new tickets (15 seconds)
    const ticketInterval = setInterval(checkForNewTickets, 15000);
    
    return () => {
      clearInterval(mainInterval);
      clearInterval(ticketInterval);
    };
  }, []);

  const previousTicketsLengthRef = useRef(0);

  // Optimized: Check only for new tickets (lightweight polling)
  const checkForNewTickets = async () => {
    try {
      const ticketsResponse = await inventoryAPI.getTickets();
      const fetchedTickets = Array.isArray(ticketsResponse.data)
        ? ticketsResponse.data
        : ticketsResponse.data.results || [];
      
      setTickets(fetchedTickets);

      // Notify if new ticket received
      if (fetchedTickets.length > previousTicketsLengthRef.current) {
        const newCount = fetchedTickets.length - previousTicketsLengthRef.current;
        setPopup({
          open: true,
          title: "Ticket Update",
          message: `You have ${newCount} new ticket update(s)!`,
          type: "info",
        });
      }
      previousTicketsLengthRef.current = fetchedTickets.length;
    } catch (err) {
      console.error("Error checking for new tickets:", err);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch current user
      const userResponse = await authAPI.getCurrentUser();
      setCurrentUser(userResponse.data);

      // Fetch devices
      const devicesResponse = await inventoryAPI.getDevices();
      let fetchedDevices = Array.isArray(devicesResponse.data)
        ? devicesResponse.data
        : devicesResponse.data.results || [];
      if (!fetchedDevices.length) fetchedDevices = mockDevices;
      setDevices(fetchedDevices);

      // Fetch assignments
      const assignmentsResponse = await inventoryAPI.getAssignments();
      let fetchedAssigns = Array.isArray(assignmentsResponse.data)
        ? assignmentsResponse.data
        : assignmentsResponse.data.results || [];
      if (!fetchedAssigns.length) {
        // try to use currentUser
        if (currentUser && currentUser.id) {
          fetchedAssigns = mockAssignments.filter(
            (a) => String(a.employee_id) === String(currentUser.id),
          ).map((a) => ({
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

      // Fetch tickets (will also be fetched by checkForNewTickets)
      const ticketsResponse = await inventoryAPI.getTickets();
      const fetchedTickets = Array.isArray(ticketsResponse.data)
        ? ticketsResponse.data
        : ticketsResponse.data.results || [];
      setTickets(fetchedTickets);
      previousTicketsLengthRef.current = fetchedTickets.length;

      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
      setLoading(false);
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
    const totalPhones = devices.filter((d) => d.device_type === "phone").length;
    const totalLaptops = devices.filter(
      (d) => d.device_type === "laptop",
    ).length;

    return {
      totalDevices,
      assignedDevices,
      availableDevices,
      maintenanceDevices,
      totalPhones,
      totalLaptops,
    };
  }, [devices]);

  const getEmployeeForDevice = (deviceId) => {
    const assignment = assignments.find(
      (a) => a.device?.id === deviceId && a.status === "active",
    );
    return assignment ? assignment.employee : undefined;
  };

  if (loading) {
    return (
      <div className="receiver-main-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receiver-main-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
          Error: {error}
        </div>
      </div>
    );
  }


  const tabs = [
    { id: "devices", label: "Devices", icon: Package },
    { id: "tickets", label: "My Tickets", icon: TicketCheck },
    { id: "mydevices", label: "My Devices", icon: Monitor },
    { id: "requesthistory", label: "Request History", icon: ClipboardList },
    { id: "overdue", label: "Return Due", icon: AlarmClock },
    { id: "reportissue", label: "Report Issue", icon: AlertCircle },
    { id: "raiserepairticket", label: "Repair Ticket", icon: Wrench },
  ];

  return (
    <div className="receiver-main-container">
      <AnimatedBackground />
      <Navbar />

      {/* Tabs */}
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

      {/* Main Content */}
      <div className="receiver-content">
        {activeTab === "devices" && (
          <UserDevicesView
            devices={devices}
            userEmail={currentUser?.email}
            getEmployeeForDevice={getEmployeeForDevice}
            onTicketCreated={fetchData}
          />
        )}

        {activeTab === "tickets" && (
          <MyTicketsView tickets={tickets} devices={devices} />
        )}

        {activeTab === "mydevices" && <MyDevices />}

        {activeTab === "requesthistory" && <RequestHistory />}

        {activeTab === "overdue" && <OverDueItems />}

        {activeTab === "reportissue" && <ReportIssue onTicketCreated={fetchData} />}

        {activeTab === "raiserepairticket" && <RaiseRepairTicket onTicketCreated={fetchData} />}
      </div>

      <PopupModal
        open={popup.open}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />

      {/* Required by React Router for nested routes */}
      <Outlet />
    </div>
  );
}

export default Receiver;
