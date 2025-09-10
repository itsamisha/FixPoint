import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Settings,
  BarChart3,
  UserCog,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import ReportCard from "../../components/ReportCard/ReportCard";
import AssignmentModal from "../../components/Modals/AssignmentModal";
import { reportService } from "../../services/reportService";
import { staffService } from "../../services/staffService";
import { useAuth } from "../../contexts/AuthContext";
import "./OrganizationDashboard.css";

const OrganizationDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);
  const [organizationReports, setOrganizationReports] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [assignmentModal, setAssignmentModal] = useState({
    isOpen: false,
    report: null,
  });
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    assignedToMe: 0,
    resolvedReports: 0,
    inProgressReports: 0,
  });

  const isAdmin = user?.userType === "ORGANIZATION_ADMIN";
  const isStaff = user?.userType === "ORGANIZATION_STAFF";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "staff" && isAdmin) {
      fetchStaff();
    }
  }, [activeTab, isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch different data based on user role
      const promises = [];

      if (isAdmin) {
        // Admin can see all organization reports, but only if they have an organizationId
        if (user.organizationId) {
          promises.push(
            reportService.getOrganizationReports(user.organizationId)
          );
        }
      }

      if (isStaff || isAdmin) {
        // Both admin and staff can see reports assigned to them
        promises.push(reportService.getAssignedReports());
      }

      const results = await Promise.all(promises);

      let resultIndex = 0;

      if (isAdmin && user.organizationId) {
        const orgReports =
          results[resultIndex].data.content || results[resultIndex].data;
        setOrganizationReports(orgReports);
        resultIndex++;

        // Calculate stats for admin
        const statsData = {
          totalReports: orgReports.length,
          pendingReports: orgReports.filter(
            (r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW"
          ).length,
          assignedToMe: orgReports.filter((r) => r.assignedTo?.id === user.id)
            .length,
          resolvedReports: orgReports.filter((r) => r.status === "RESOLVED")
            .length,
          inProgressReports: orgReports.filter(
            (r) => r.status === "IN_PROGRESS"
          ).length,
        };
        setStats(statsData);

        if (results[resultIndex]) {
          setAssignedReports(
            results[resultIndex].data.content || results[resultIndex].data
          );
        }
      } else if (isStaff) {
        const assignedReports = results[0].data.content || results[0].data;
        setAssignedReports(assignedReports);

        // Calculate stats for staff
        const statsData = {
          totalReports: assignedReports.length,
          pendingReports: assignedReports.filter(
            (r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW"
          ).length,
          assignedToMe: assignedReports.length,
          resolvedReports: assignedReports.filter(
            (r) => r.status === "RESOLVED"
          ).length,
          inProgressReports: assignedReports.filter(
            (r) => r.status === "IN_PROGRESS"
          ).length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (!isAdmin) return;

    setStaffLoading(true);
    try {
      const response = await staffService.getOrganizationStaff();
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff data");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAssignReport = async (reportId, staffMemberId) => {
    try {
      await reportService.assignReport(reportId, staffMemberId);
      toast.success("Report assigned successfully");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error assigning report:", error);
      toast.error("Failed to assign report");
    }
  };

  const openAssignmentModal = (report) => {
    setAssignmentModal({
      isOpen: true,
      report: report,
    });
  };

  const closeAssignmentModal = () => {
    setAssignmentModal({
      isOpen: false,
      report: null,
    });
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await reportService.updateReportStatus(reportId, status);
      toast.success("Report status updated successfully");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
    description,
    action,
  }) => (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-content">
          <h1>
            {isAdmin ? "Organization Admin Dashboard" : "Staff Dashboard"}
          </h1>
          <p>
            {user?.organization?.name} • {user?.jobTitle}
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {isAdmin && (
              <>
                <Link to="/organization/staff" className="btn btn-primary">
                  <UserPlus className="btn-icon" />
                  Manage Staff
                </Link>
                <Link to="/organization/reports" className="btn btn-success">
                  <FileText className="btn-icon" />
                  All Reports
                </Link>
                <Link to="/organization/settings" className="btn btn-secondary">
                  <Settings className="btn-icon" />
                  Settings
                </Link>
              </>
            )}
            <Link to="/reports/assigned" className="btn btn-outline">
              <UserCog className="btn-icon" />
              My Assigned Reports
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {isAdmin && (
            <div className="stat-card" style={{ borderLeftColor: "#3B82F6" }}>
              <div className="stat-card-content">
                <div className="stat-card-info">
                  <h3>Total Reports</h3>
                  <div className="stat-card-value" style={{ color: "#3B82F6" }}>
                    {stats.totalReports}
                  </div>
                  <p className="stat-card-description">
                    All organization reports
                  </p>
                </div>
                <FileText
                  className="stat-card-icon"
                  style={{ color: "#3B82F6" }}
                />
              </div>
            </div>
          )}
          <div className="stat-card" style={{ borderLeftColor: "#F59E0B" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>Pending</h3>
                <div className="stat-card-value" style={{ color: "#F59E0B" }}>
                  {stats.pendingReports}
                </div>
                <p className="stat-card-description">Awaiting action</p>
              </div>
              <Clock className="stat-card-icon" style={{ color: "#F59E0B" }} />
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#8B5CF6" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>Assigned to Me</h3>
                <div className="stat-card-value" style={{ color: "#8B5CF6" }}>
                  {stats.assignedToMe}
                </div>
                <p className="stat-card-description">Your active reports</p>
              </div>
              <UserCog
                className="stat-card-icon"
                style={{ color: "#8B5CF6" }}
              />
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#06B6D4" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>In Progress</h3>
                <div className="stat-card-value" style={{ color: "#06B6D4" }}>
                  {stats.inProgressReports}
                </div>
                <p className="stat-card-description">Being worked on</p>
              </div>
              <Users className="stat-card-icon" style={{ color: "#06B6D4" }} />
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#10B981" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>Resolved</h3>
                <div className="stat-card-value" style={{ color: "#10B981" }}>
                  {stats.resolvedReports}
                </div>
                <p className="stat-card-description">Successfully completed</p>
              </div>
              <CheckCircle
                className="stat-card-icon"
                style={{ color: "#10B981" }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <div className="tab-list">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "assigned", label: "My Assigned Reports", icon: UserCog },
              ...(isAdmin
                ? [
                    {
                      id: "all-reports",
                      label: "All Organization Reports",
                      icon: FileText,
                    },
                  ]
                : []),
              ...(isAdmin
                ? [{ id: "staff", label: "Staff Management", icon: Users }]
                : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              >
                <tab.icon className="tab-icon" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Recent Assigned Reports
                  </h3>
                  {assignedReports.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {assignedReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {report.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {report.category}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Reported by: {report.reporter?.fullName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  report.status === "RESOLVED"
                                    ? "bg-green-100 text-green-800"
                                    : report.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {report.status.replace(/_/g, " ")}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  report.priority === "HIGH"
                                    ? "bg-red-100 text-red-800"
                                    : report.priority === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {report.priority}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            {report.status !== "RESOLVED" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateReportStatus(
                                      report.id,
                                      "IN_PROGRESS"
                                    )
                                  }
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Start Work
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateReportStatus(
                                      report.id,
                                      "RESOLVED"
                                    )
                                  }
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Mark Resolved
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <Link
                        to="#"
                        onClick={() => setActiveTab("assigned")}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all assigned reports →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No reports assigned to you yet.
                      </p>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Recent Organization Reports
                    </h3>
                    {organizationReports.slice(0, 3).length > 0 ? (
                      <div className="space-y-3">
                        {organizationReports.slice(0, 3).map((report) => (
                          <div
                            key={report.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {report.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  by {report.reporter?.fullName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {report.assignedTo
                                    ? `Assigned to: ${report.assignedTo.fullName}`
                                    : "Unassigned"}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  report.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Link
                          to="#"
                          onClick={() => setActiveTab("all-reports")}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View all organization reports →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 py-8">
                        No recent reports for your organization.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "assigned" && (
            <div className="p-6">
              <div className="content-header">
                <h2 className="content-title">My Assigned Reports</h2>
              </div>

              {assignedReports.length > 0 ? (
                <div className="reports-grid">
                  {assignedReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      showAssignButton={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <UserCog className="empty-state-icon" />
                  <h3 className="empty-state-title">No assigned reports</h3>
                  <p className="empty-state-description">
                    Reports assigned to you will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {isAdmin && activeTab === "all-reports" && (
            <div className="p-6">
              <div className="content-header">
                <h2 className="content-title">All Organization Reports</h2>
              </div>
              {organizationReports.length > 0 ? (
                <div className="reports-grid">
                  {organizationReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      showAssignButton={true}
                      onAssign={(report) => openAssignmentModal(report)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FileText className="empty-state-icon" />
                  <h3 className="empty-state-title">No reports</h3>
                  <p className="empty-state-description">
                    Reports submitted to your organization will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {isAdmin && activeTab === "staff" && (
            <div className="p-6">
              <div className="content-header">
                <h2 className="content-title">Staff Management</h2>
                <Link
                  to="/organization/staff/invite"
                  className="btn btn-primary"
                >
                  <UserPlus className="btn-icon" />
                  Invite Staff Member
                </Link>
              </div>

              {staffLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Loading staff...</p>
                </div>
              ) : staff.length === 0 ? (
                <div className="empty-state">
                  <Users className="empty-state-icon" />
                  <h3 className="empty-state-title">No Staff Members</h3>
                  <p className="empty-state-description">
                    Your organization doesn't have any staff members yet.
                  </p>
                  <Link
                    to="/organization/staff/invite"
                    className="btn btn-primary"
                  >
                    <UserPlus className="btn-icon" />
                    Invite Your First Staff Member
                  </Link>
                </div>
              ) : (
                <div className="staff-list">
                  <div className="content-header">
                    <h3 className="content-title">
                      Staff Members ({staff.length})
                    </h3>
                  </div>
                  {staff.map((member) => (
                    <div key={member.id} className="staff-item">
                      <div className="staff-content">
                        <div className="staff-info">
                          <div className="staff-avatar">
                            {member.fullName
                              ? member.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : member.username[0].toUpperCase()}
                          </div>
                          <div className="staff-details">
                            <div className="flex items-center gap-2">
                              <h4>{member.fullName || member.username}</h4>
                              {!member.isActive && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="staff-meta">
                              {member.jobTitle && (
                                <span>{member.jobTitle}</span>
                              )}
                              {member.department && (
                                <span>{member.department}</span>
                              )}
                              {member.employeeId && (
                                <span>ID: {member.employeeId}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {member.email && (
                            <div className="staff-contact">
                              <Mail className="w-4 h-4" />
                              <span>{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="staff-contact mt-1">
                              <Phone className="w-4 h-4" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="staff-actions">
                          <button
                            className="btn btn-outline btn-sm"
                            title="View Details"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assignment Modal */}
        <AssignmentModal
          isOpen={assignmentModal.isOpen}
          onClose={closeAssignmentModal}
          report={assignmentModal.report}
          onAssign={handleAssignReport}
        />
      </div>
    </div>
  );
};

export default OrganizationDashboard;
