import { useState, useMemo } from "react";
import { LayoutDashboard, Package, TicketCheck } from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import UserDevicesView from "../components/user/userDevices/UserDevicesView";
import MyTicketsView from "../components/user/userTicket/MyTicketsView";
import AnimatedBackground from "../components/animatedBackground/AnimatedBackground";
import {
  mockDevices,
  mockEmployees,
  mockAssignments,
  mockTickets,
} from "../assets/data/mockData";
import "./Receiver.css";

function Receiver() {
  const [activeTab, setActiveTab] = useState("devices");
  const [devices] = useState(mockDevices);
  const [employees] = useState(mockEmployees);
  const [assignments] = useState(mockAssignments);
  const [tickets] = useState(mockTickets);

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

  const getEmployeeForDevice = (deviceId) => {
    const assignment = assignments.find(
      (a) => a.device_id === deviceId && a.status === "active",
    );
    return assignment
      ? employees.find((e) => e.id === assignment.employee_id)
      : undefined;
  };

  const tabs = [
    { id: "devices", label: "Devices", icon: Package },
    { id: "tickets", label: "My Tickets", icon: TicketCheck },
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
                onClick={() => setActiveTab(tab.id)}
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
            employees={employees}
            getEmployeeForDevice={getEmployeeForDevice}
          />
        )}
        {activeTab === "tickets" && (
          <MyTicketsView tickets={tickets} devices={devices} />
        )}
      </div>
    </div>
  );
}

export default Receiver;
