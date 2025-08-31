import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  PlayCircle,
  PauseCircle,
  Settings,
  UserCog,
  Calendar,
  MapPin,
  MessageSquare,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { reportService } from "../services/reportService";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [assignedReports, setAssignedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReport, setSelectedReport] = useState(null);
  const [progressUpdate, setProgressUpdate] = useState({
    progressPercentage: 0,
    progressNotes: "",
    workStage: "NOT_STARTED",
  });

  const workStages = [
    {
      value: "NOT_STARTED",
      label: "Not Started",
      color: "#9CA3AF",
      icon: Clock,
    },
    {
      value: "ASSESSMENT",
      label: "Assessment",
      color: "#F59E0B",
      icon: AlertCircle,
    },
    { value: "PLANNING", label: "Planning", color: "#3B82F6", icon: BarChart3 },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      color: "#06B6D4",
      icon: PlayCircle,
    },
    {
      value: "QUALITY_CHECK",
      label: "Quality Check",
      color: "#8B5CF6",
      icon: CheckCircle,
    },
    {
      value: "COMPLETED",
      label: "Completed",
      color: "#10B981",
      icon: CheckCircle,
    },
    { value: "ON_HOLD", label: "On Hold", color: "#EF4444", icon: PauseCircle },
  ];

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const fetchAssignedReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getMyAssignedReports();
      setAssignedReports(response.data.content || response.data);
    } catch (error) {
      console.error("Error fetching assigned reports:", error);
      toast.error("Failed to load assigned reports");
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (reportId) => {
    try {
      await reportService.updateReportProgress(reportId, progressUpdate);
      toast.success("Progress updated successfully");
      setSelectedReport(null);
      fetchAssignedReports(); // Refresh data
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const getStageColor = (stage) => {
    const stageObj = workStages.find((s) => s.value === stage);
    return stageObj ? stageObj.color : "#9CA3AF";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "#10B981";
    if (percentage >= 75) return "#06B6D4";
    if (percentage >= 50) return "#3B82F6";
    if (percentage >= 25) return "#F59E0B";
    return "#EF4444";
  };

  const filteredReports = assignedReports.filter((report) => {
    if (activeTab === "active") {
      return report.status !== "RESOLVED" && report.status !== "REJECTED";
    } else if (activeTab === "completed") {
      return report.status === "RESOLVED";
    }
    return true;
  });

  const stats = {
    total: assignedReports.length,
    active: assignedReports.filter(
      (r) => r.status !== "RESOLVED" && r.status !== "REJECTED"
    ).length,
    completed: assignedReports.filter((r) => r.status === "RESOLVED").length,
    inProgress: assignedReports.filter((r) => r.workStage === "IN_PROGRESS")
      .length,
    urgent: assignedReports.filter((r) => r.priority === "URGENT").length,
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
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
          <h1>Staff Dashboard</h1>
          <p>
            Welcome back, {user?.fullName} • {user?.organization?.name}
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className="btn btn-primary"
            >
              <BarChart3 className="btn-icon" />
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className="btn btn-success"
            >
              <Activity className="btn-icon" />
              Active Tasks
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className="btn btn-secondary"
            >
              <CheckCircle className="btn-icon" />
              Completed Tasks
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: "#3B82F6" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>Total Assigned</h3>
                <div className="stat-card-value" style={{ color: "#3B82F6" }}>
                  {stats.total}
                </div>
                <p className="stat-card-description">
                  All tasks assigned to you
                </p>
              </div>
              <FileText
                className="stat-card-icon"
                style={{ color: "#3B82F6" }}
              />
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: "#F59E0B" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>Active Tasks</h3>
                <div className="stat-card-value" style={{ color: "#F59E0B" }}>
                  {stats.active}
                </div>
                <p className="stat-card-description">Currently in progress</p>
              </div>
              <Clock className="stat-card-icon" style={{ color: "#F59E0B" }} />
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: "#06B6D4" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>In Progress</h3>
                <div className="stat-card-value" style={{ color: "#06B6D4" }}>
                  {stats.inProgress}
                </div>
                <p className="stat-card-description">Being worked on</p>
              </div>
              <PlayCircle
                className="stat-card-icon"
                style={{ color: "#06B6D4" }}
              />
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: "#10B981" }}>
            <div className="stat-card-content">
              <div className="stat-card-info">
                <h3>Completed</h3>
                <div className="stat-card-value" style={{ color: "#10B981" }}>
                  {stats.completed}
                </div>
                <p className="stat-card-description">Successfully finished</p>
              </div>
              <CheckCircle
                className="stat-card-icon"
                style={{ color: "#10B981" }}
              />
            </div>
          </div>

          {stats.urgent > 0 && (
            <div className="stat-card" style={{ borderLeftColor: "#EF4444" }}>
              <div className="stat-card-content">
                <div className="stat-card-info">
                  <h3>Urgent Tasks</h3>
                  <div className="stat-card-value" style={{ color: "#EF4444" }}>
                    {stats.urgent}
                  </div>
                  <p className="stat-card-description">
                    Require immediate attention
                  </p>
                </div>
                <AlertCircle
                  className="stat-card-icon"
                  style={{ color: "#EF4444" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <div className="tab-list">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "active", label: "Active Tasks", icon: Activity },
              { id: "completed", label: "Completed", icon: CheckCircle },
              { id: "all", label: "All Reports", icon: FileText },
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
                    Recent Active Tasks
                  </h3>
                  {filteredReports.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {filteredReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="report-card">
                          <div className="report-header">
                            <div>
                              <h4 className="report-title">{report.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {report.category?.replace(/_/g, " ")}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Reported by: {report.reporter?.fullName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span
                                className={`report-status ${
                                  report.status === "RESOLVED"
                                    ? "status-resolved"
                                    : report.status === "IN_PROGRESS"
                                    ? "status-in-progress"
                                    : "status-pending"
                                }`}
                              >
                                {report.status.replace(/_/g, " ")}
                              </span>
                              <span
                                className={`priority-badge ${
                                  report.priority === "URGENT"
                                    ? "priority-urgent"
                                    : report.priority === "HIGH"
                                    ? "priority-high"
                                    : report.priority === "MEDIUM"
                                    ? "priority-medium"
                                    : "priority-low"
                                }`}
                              >
                                {report.priority}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Progress
                              </span>
                              <span className="text-sm text-gray-600">
                                {report.progressPercentage || 0}%
                              </span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${report.progressPercentage || 0}%`,
                                  backgroundColor: getProgressColor(
                                    report.progressPercentage || 0
                                  ),
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setProgressUpdate({
                                  progressPercentage:
                                    report.progressPercentage || 0,
                                  progressNotes: report.progressNotes || "",
                                  workStage: report.workStage || "NOT_STARTED",
                                });
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              <Settings className="w-4 h-4" />
                              Update Progress
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setActiveTab("active")}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all active tasks →
                      </button>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No active tasks assigned to you yet.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Work Stage Distribution
                  </h3>
                  <div className="space-y-3">
                    {workStages.map((stage) => {
                      const count = assignedReports.filter(
                        (r) => r.workStage === stage.value
                      ).length;
                      if (count === 0) return null;

                      return (
                        <div key={stage.value} className="stage-item">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: stage.color }}
                              ></div>
                              <span className="text-sm font-medium">
                                {stage.label}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "active" ||
            activeTab === "completed" ||
            activeTab === "all") && (
            <div className="p-6">
              <div className="content-header">
                <h2 className="content-title">
                  {activeTab === "active"
                    ? "Active Tasks"
                    : activeTab === "completed"
                    ? "Completed Tasks"
                    : "All Assigned Reports"}
                </h2>
                <div className="content-actions">
                  <span className="text-sm text-gray-600">
                    {filteredReports.length}{" "}
                    {filteredReports.length === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>

              {filteredReports.length > 0 ? (
                <div className="reports-grid">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="report-card">
                      <div className="report-header">
                        <div>
                          <h4 className="report-title">{report.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {report.category?.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reported by: {report.reporter?.fullName}
                          </p>
                          {report.location && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {report.location}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span
                            className={`report-status ${
                              report.status === "RESOLVED"
                                ? "status-resolved"
                                : report.status === "IN_PROGRESS"
                                ? "status-in-progress"
                                : "status-pending"
                            }`}
                          >
                            {report.status.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`priority-badge ${
                              report.priority === "URGENT"
                                ? "priority-urgent"
                                : report.priority === "HIGH"
                                ? "priority-high"
                                : report.priority === "MEDIUM"
                                ? "priority-medium"
                                : "priority-low"
                            }`}
                          >
                            {report.priority}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress
                          </span>
                          <span className="text-sm text-gray-600">
                            {report.progressPercentage || 0}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${report.progressPercentage || 0}%`,
                              backgroundColor: getProgressColor(
                                report.progressPercentage || 0
                              ),
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Work Stage */}
                      <div className="mb-4">
                        <span
                          className="work-stage-badge"
                          style={{
                            backgroundColor: getStageColor(
                              report.workStage || "NOT_STARTED"
                            ),
                          }}
                        >
                          {
                            workStages.find(
                              (s) =>
                                s.value === (report.workStage || "NOT_STARTED")
                            )?.label
                          }
                        </span>
                      </div>

                      {/* Progress Notes */}
                      {report.progressNotes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-700">
                                {report.progressNotes}
                              </p>
                              {report.progressUpdatedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Updated:{" "}
                                  {new Date(
                                    report.progressUpdatedAt
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setProgressUpdate({
                              progressPercentage:
                                report.progressPercentage || 0,
                              progressNotes: report.progressNotes || "",
                              workStage: report.workStage || "NOT_STARTED",
                            });
                          }}
                          className="btn btn-primary flex-1"
                        >
                          <Settings className="w-4 h-4" />
                          Update Progress
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === "active"
                      ? "No active tasks assigned to you."
                      : activeTab === "completed"
                      ? "No completed tasks yet."
                      : "No reports assigned to you."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Update Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Update Progress</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="text-sm text-gray-600 mb-4">
                {selectedReport.title}
              </p>

              <div className="space-y-4">
                {/* Progress Percentage */}
                <div>
                  <label className="form-label">
                    Progress Percentage: {progressUpdate.progressPercentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressUpdate.progressPercentage}
                    onChange={(e) =>
                      setProgressUpdate((prev) => ({
                        ...prev,
                        progressPercentage: parseInt(e.target.value),
                      }))
                    }
                    className="form-range"
                  />
                </div>

                {/* Work Stage */}
                <div>
                  <label className="form-label">Work Stage</label>
                  <select
                    value={progressUpdate.workStage}
                    onChange={(e) =>
                      setProgressUpdate((prev) => ({
                        ...prev,
                        workStage: e.target.value,
                      }))
                    }
                    className="form-select"
                  >
                    {workStages.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Progress Notes */}
                <div>
                  <label className="form-label">Progress Notes</label>
                  <textarea
                    value={progressUpdate.progressNotes}
                    onChange={(e) =>
                      setProgressUpdate((prev) => ({
                        ...prev,
                        progressNotes: e.target.value,
                      }))
                    }
                    rows="3"
                    className="form-textarea"
                    placeholder="Describe the current progress and any updates..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedReport(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProgressUpdate(selectedReport.id)}
                className="btn btn-primary"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
