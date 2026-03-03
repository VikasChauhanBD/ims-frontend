import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Ticket,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Dashboard from "../../components/admin/dashboard/Dashboard";
import DevicesView from "../../components/admin/devices/DevicesView";
import EmployeesView from "../../components/admin/employees/EmployeesView";
import AssignmentsView from "../../components/admin/assignments/AssignmentsView";
import TicketRequestsView from "../../components/admin/ticketRequestsView/TicketRequestsView";
import AnimatedBackground from "../../components/animatedBackground/AnimatedBackground";
import { inventoryAPI, employeeAPI } from "../../services/api";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive activeTab from the current URL
  const activeTab = location.pathname.split("/admin/")[1] || "dashboard";

  const [devices, setDevices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
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

      // Fetch devices
      const devicesResponse = await inventoryAPI.getDevices();
      setDevices(Array.isArray(devicesResponse.data) ? devicesResponse.data : devicesResponse.data.results || []);

      // Fetch employees
      const employeesResponse = await employeeAPI.getEmployees();
      setEmployees(Array.isArray(employeesResponse.data) ? employeesResponse.data : employeesResponse.data.results || []);

      // Fetch assignments
      const assignmentsResponse = await inventoryAPI.getAssignments();
      setAssignments(Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : assignmentsResponse.data.results || []);

      // Fetch tickets
      const ticketsResponse = await inventoryAPI.getTickets();
      setTickets(Array.isArray(ticketsResponse.data) ? ticketsResponse.data : ticketsResponse.data.results || []);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching admin data:", err);
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
      device: devices.find((d) => d.id === assignment.device_id || d.id === assignment.device),
      employee: employees.find((e) => e.id === assignment.employee_id || e.id === assignment.employee),
    }));
  }, [assignments, devices, employees]);

  const getEmployeeForDevice = (deviceId) => {
    const assignment = assignments.find(
      (a) => (a.device_id === deviceId || a.device?.id === deviceId) && a.status === "active",
    );
    return assignment
      ? employees.find((e) => e.id === assignment.employee_id || e.id === assignment.employee)
      : undefined;
  };

  if (loading) {
    return (
      <div className="admin-main-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-main-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "devices", label: "Devices", icon: Package },
    { id: "employees", label: "Employees", icon: Users },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "ticketrequests", label: "Ticket Requests", icon: Ticket },
  ];

  return (
    <div className="admin-main-container">
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {activeTab === "dashboard" && <Dashboard stats={stats} />}

        {activeTab === "devices" && (
          <DevicesView
            devices={devices}
            employees={employees}
            getEmployeeForDevice={getEmployeeForDevice}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "employees" && (
          <EmployeesView
            employees={employees}
            getDeviceCountForEmployee={(id) =>
              assignments.filter(
                (a) => (a.employee_id === id || a.employee?.id === id) && a.status === "active",
              ).length
            }
            onRefresh={fetchData}
          />
        )}

        {activeTab === "assignments" && (
          <AssignmentsView assignments={assignmentsWithDetails} />
        )}

        {activeTab === "ticketrequests" && (
          <TicketRequestsView
            tickets={tickets}
            setTickets={setTickets}
            devices={devices}
            employees={employees}
            onRefresh={fetchData}
          />
        )}
      </div>

      {/* Required by React Router for nested routes */}
      <Outlet />
    </div>
  );
}

export default Admin;
