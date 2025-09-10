import React from "react";
import {
  BrowserRouter as Router,
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./components/NotificationCenter/NotificationOverrides.css";

import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Navbar from "./components/Navigation/Navbar";
import Chatbot from "./components/Chatbot/Chatbot";
import Home from "./pages/General/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import DashboardRouter from "./pages/Dashboard/DashboardRouter";
import ReportForm from "./pages/Reports/ReportForm";
import ReportDetails from "./pages/Reports/ReportDetails";
import MapView from "./pages/Maps/MapView";
import StaffManagement from "./pages/Staff/StaffManagement";
import OrganizationReports from "./pages/Organization/OrganizationReports";
import OrganizationSettings from "./pages/Organization/OrganizationSettings";
import AssignedReports from "./pages/Reports/AssignedReports";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import VolunteerDashboard from "./pages/Volunteers/VolunteerDashboard";
import EmailVerification from "./components/EmailVerification/EmailVerification";
import ProtectedRoute from "./components/Security/ProtectedRoute";
import NotificationTestPage from "./pages/Testing/NotificationTestPage";

// Use HashRouter for GitHub Pages, BrowserRouter for local development
const isGitHubPages = window.location.hostname === "itsamisha.github.io";
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
