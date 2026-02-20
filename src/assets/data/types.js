// Employee type (for reference/documentation)
export const Employee = {
  id: "",
  name: "",
  email: "",
  department: "",
  position: "",
  status: "active", // or 'inactive'
  created_at: "",
};

// Device type
export const Device = {
  id: "",
  device_type: "phone", // or 'laptop'
  brand: "",
  model: "",
  serial_number: "",
  purchase_date: "",
  status: "available", // or 'assigned', 'maintenance', 'retired'
  condition: "good", // 'excellent', 'fair', 'poor'
  notes: "",
  created_at: "",
};

// Assignment type
export const Assignment = {
  id: "",
  device_id: "",
  employee_id: "",
  assigned_date: "",
  returned_date: null,
  status: "active", // or 'returned'
  notes: "",
  created_at: "",
};

// Assignment with device and employee details
export const AssignmentWithDetails = {
  ...Assignment,
  device: Device,
  employee: Employee,
};

// Dashboard stats summary
export const DashboardStats = {
  totalDevices: 0,
  assignedDevices: 0,
  availableDevices: 0,
  maintenanceDevices: 0,
  totalEmployees: 0,
  activeEmployees: 0,
  totalPhones: 0,
  totalLaptops: 0,
};
