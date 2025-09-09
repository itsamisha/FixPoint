import React from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./components/NotificationOverrides.css";

import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
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
import StaffDashboard from "./pages/StaffDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import EmailVerification from "./components/EmailVerification";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationTestPage from "./pages/NotificationTestPage";

// Use HashRouter for GitHub Pages, BrowserRouter for local development
const isGitHubPages = window.location.hostname === 'itsamisha.github.io';
const RouterComponent = isGitHubPages ? HashRouter : Router;

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <RouterComponent>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<EmailVerification />} />
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
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/dashboard"
                  element={
                    <ProtectedRoute>
                      <VolunteerDashboard />
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
                <Route
                  path="/notifications/test"
                  element={
                    <ProtectedRoute>
                      <NotificationTestPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Chatbot />
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </RouterComponent>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
