import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import AdvancedDashboard from "./Pages/advanceddashboard/AdvancedDashboard"; 
import TreatmentsTable from "./Tabels/TreatmentsTable";
import TreatmentDetails from './components/TreatmentDetails';
import CreateTreatment from './components/CreateTreatment';
import CustomerVehicles from './components/CustomerVehicles';
import NewAppointmentForm from './components/AppointmentsForm';
import InvoicePage from './components/InvoicePage';
import AddCustomerWithVehicle from './components/AddCustomerWithVehicle';
import AddVehicle from './components/AddVehicle';
import MonthlyReport from './components/MonthlyReportComponent';
import AddUser from './components/add_users';


function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* 🔹 ברירת מחדל ("/") תוביל ל־Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* 🛠️ שאר הדפים נשארים כפי שהם */}
        <Route path="/monthlyreport" element={<MonthlyReport />} />
        <Route path="/AppointmentForm" element={<NewAppointmentForm />} />
        <Route path="/appointments/edit/:id" element={<NewAppointmentForm />} />
        <Route path="/treatment/:id" element={<TreatmentDetails />} />
        <Route path="/treatments" element={<TreatmentsTable />} />
        <Route path="/customer-vehicles/:customerId" element={<CustomerVehicles />} />
        <Route path="/AdvancedDashboard" element={<AdvancedDashboard />} />
        <Route path="/create-treatment" element={<CreateTreatment />} />
        <Route path="/invoice/:treatmentId" element={<InvoicePage />} />
        <Route path="/add-customer-with-vehicle" element={<AddCustomerWithVehicle />} />
        <Route path="/add-user-form" element={<AddUser />} />
        <Route path="/complete-vehicle/:plateNumber" element={<AddVehicle />} />
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* 🔁 אם כתובת לא קיימת – העבר ל־Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </>
  );
}

export default App;
