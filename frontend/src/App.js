import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardRouter from "./pages/DashboardRouter";
import ReportForm from "./pages/ReportForm";
import ReportDetails from "./pages/ReportDetails";
import MapView from "./pages/MapView";
import StaffManagement from "./pages/StaffManagement";
import OrganizationReports from "./pages/OrganizationReports";
import OrganizationSettings from "./pages/OrganizationSettings";
import AssignedReports from "./pages/AssignedReports";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/reports/:id" element={<ReportDetails />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/staff"
                  element={
                    <ProtectedRoute>
                      <StaffManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/reports"
                  element={
                    <ProtectedRoute>
                      <OrganizationReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/settings"
                  element={
                    <ProtectedRoute>
                      <OrganizationSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports/assigned"
                  element={
                    <ProtectedRoute>
                      <AssignedReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportForm />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
