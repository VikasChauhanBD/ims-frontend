import React, { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import EmployeeCard from "./EmployeeCard";
import "./EmployeesView.css";

export default function EmployeesView({
  employees = [],
  getDeviceCountForEmployee,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const departments = Array.from(
    new Set(employees.map((emp) => emp.department))
  );

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || employee.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" || employee.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="employees-main-container">
      <div className="employees-header">
        <div>
          <h2>Employees</h2>
          <p>Manage employee records and assignments</p>
        </div>
        <button className="employee-add-btn">
          <Plus className="employee-btn-icon" />
          Add Employee
        </button>
      </div>

      <div className="employees-filters">
        <div className="employee-search-box">
          <Search className="employee-search-icon" />
          <input
            type="text"
            placeholder="Search employees by name, email, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="employee-filter-boxes">
          <div className="employee-filter-select">
            <Filter className="employee-filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="employee-filter-select">
            <Filter className="employee-filter-icon" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="no-employees">
          <p>No employees found matching your criteria</p>
        </div>
      ) : (
        <div className="employees-grid">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              deviceCount={getDeviceCountForEmployee(employee.id)}
            />
          ))}
        </div>
      )}

      <div className="employees-footer">
        <p>
          Showing {filteredEmployees.length} of {employees.length} employees
        </p>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { Search, Filter, Plus, X } from "lucide-react";
// import EmployeeCard from "./EmployeeCard";
// import "./EmployeesView.css";

// export default function EmployeesView({
//   employees = [],
//   getDeviceCountForEmployee,
// }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterDepartment, setFilterDepartment] = useState("all");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   const departments = Array.from(
//     new Set(employees.map((emp) => emp.department))
//   );

//   const filteredEmployees = employees.filter((employee) => {
//     const matchesSearch =
//       employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.position.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       filterStatus === "all" || employee.status === filterStatus;
//     const matchesDepartment =
//       filterDepartment === "all" || employee.department === filterDepartment;

//     return matchesSearch && matchesStatus && matchesDepartment;
//   });

//   const handleViewDetails = (employee) => {
//     setSelectedEmployee(employee);
//   };

//   const closeModal = () => {
//     setSelectedEmployee(null);
//   };

//   return (
//     <div className="employees-main-container">
//       {/* ===== Header ===== */}
//       <div className="employees-header">
//         <div>
//           <h2>Employees</h2>
//           <p>Manage employee records and assignments</p>
//         </div>
//         <button className="employee-add-btn">
//           <Plus className="employee-btn-icon" />
//           Add Employee
//         </button>
//       </div>

//       {/* ===== Filters ===== */}
//       <div className="employees-filters">
//         <div className="employee-search-box">
//           <Search className="employee-search-icon" />
//           <input
//             type="text"
//             placeholder="Search employees by name, email, or position..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div className="employee-filter-boxes">
//           <div className="employee-filter-select">
//             <Filter className="employee-filter-icon" />
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//             >
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//           <div className="employee-filter-select">
//             <Filter className="employee-filter-icon" />
//             <select
//               value={filterDepartment}
//               onChange={(e) => setFilterDepartment(e.target.value)}
//             >
//               <option value="all">All Departments</option>
//               {departments.map((dept) => (
//                 <option key={dept} value={dept}>
//                   {dept}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* ===== Employee Cards ===== */}
//       {filteredEmployees.length === 0 ? (
//         <div className="no-employees">
//           <p>No employees found matching your criteria</p>
//         </div>
//       ) : (
//         <div className="employees-grid">
//           {filteredEmployees.map((employee) => (
//             <EmployeeCard
//               key={employee.id}
//               employee={employee}
//               deviceCount={getDeviceCountForEmployee(employee.id)}
//               onViewDetails={handleViewDetails}
//             />
//           ))}
//         </div>
//       )}

//       {/* ===== Footer ===== */}
//       <div className="employees-footer">
//         <p>
//           Showing {filteredEmployees.length} of {employees.length} employees
//         </p>
//       </div>

//       {/* ===== Employee Detail Modal ===== */}
//       {selectedEmployee && (
//         <div className="employee-modal-overlay" onClick={closeModal}>
//           <div
//             className="employee-modal"
//             onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
//           >
//             <button className="employee-modal-close" onClick={closeModal}>
//               <X size={20} />
//             </button>
//             <h3>{selectedEmployee.name}</h3>
//             <p>{selectedEmployee.position}</p>
//             <div className="employee-modal-info">
//               <p>
//                 <strong>Email:</strong> {selectedEmployee.email}
//               </p>
//               <p>
//                 <strong>Department:</strong> {selectedEmployee.department}
//               </p>
//               <p>
//                 <strong>Status:</strong> {selectedEmployee.status}
//               </p>
//               <p>
//                 <strong>Devices:</strong>{" "}
//                 {getDeviceCountForEmployee(selectedEmployee.id)} assigned
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
