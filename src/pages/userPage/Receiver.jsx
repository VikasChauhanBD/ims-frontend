import { useState, useMemo, useEffect } from "react";
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
import { inventoryAPI, authAPI } from "../../services/api";
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

  // Fetch data from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current user
      const userResponse = await authAPI.getCurrentUser();
      setCurrentUser(userResponse.data);

      // Fetch devices
      const devicesResponse = await inventoryAPI.getDevices();
      setDevices(Array.isArray(devicesResponse.data) ? devicesResponse.data : devicesResponse.data.results || []);

      // Fetch assignments
      const assignmentsResponse = await inventoryAPI.getAssignments();
      setAssignments(Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : assignmentsResponse.data.results || []);

      // Fetch tickets
      const ticketsResponse = await inventoryAPI.getTickets();
      setTickets(Array.isArray(ticketsResponse.data) ? ticketsResponse.data : ticketsResponse.data.results || []);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
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

      {/* Required by React Router for nested routes */}
      <Outlet />
    </div>
  );
}

export default Receiver;
