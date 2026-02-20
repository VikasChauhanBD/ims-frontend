import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Ticket,
} from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import Dashboard from "../components/admin/dashboard/Dashboard";
import DevicesView from "../components/admin/devices/DevicesView";
import EmployeesView from "../components/admin/employees/EmployeesView";
import AssignmentsView from "../components/admin/assignments/AssignmentsView";
import TicketRequestsView from "../components/admin/ticketRequestsView/TicketRequestsView";
import AnimatedBackground from "../components/animatedBackground/AnimatedBackground";
import {
  mockDevices,
  mockEmployees,
  mockAssignments,
  mockTickets,
} from "../assets/data/mockData";
import "./Admin.css";

function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [devices] = useState(mockDevices);
  const [employees] = useState(mockEmployees);
  const [assignments] = useState(mockAssignments);
  const [tickets, setTickets] = useState(mockTickets);
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
      (e) => e.status === "active",
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
      device: devices.find((d) => d.id === assignment.device_id),
      employee: employees.find((e) => e.id === assignment.employee_id),
    }));
  }, [assignments, devices, employees]);

  const getEmployeeForDevice = (deviceId) => {
    const assignment = assignments.find(
      (a) => a.device_id === deviceId && a.status === "active",
    );
    return assignment
      ? employees.find((e) => e.id === assignment.employee_id)
      : undefined;
  };

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
                onClick={() => setActiveTab(tab.id)}
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
          />
        )}

        {activeTab === "employees" && (
          <EmployeesView
            employees={employees}
            getDeviceCountForEmployee={(id) =>
              assignments.filter(
                (a) => a.employee_id === id && a.status === "active",
              ).length
            }
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
          />
        )}
      </div>
    </div>
  );
}

export default Admin;
