import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  CheckSquare,
  BarChart3,
  Calendar,
  MapPin,
  User,
  FileText,
  TrendingUp,
  Target,
  Activity,
  Trophy,
  Star,
  Award,
  Users,
  Plus,
  Eye,
  Edit3,
} from "lucide-react";
import { toast } from "react-toastify";
import { reportService } from "../services/reportService";
import { volunteerService } from "../services/volunteerService";
import { useAuth } from "../contexts/AuthContext";
import ReportExporter from "../components/ReportExporter";
import VolunteerCertificate from "../components/VolunteerCertificate";
import "./VolunteerDashboard.css";

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [allReports, setAllReports] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [volunteerLeaderboard, setVolunteerLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [progressNotes, setProgressNotes] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [selectedWorkStage, setSelectedWorkStage] = useState("");
  const [selectedReports, setSelectedReports] = useState([]);
  const [isExportMode, setIsExportMode] = useState(false);

  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    communityReports: 0,
    myImpact: 0,
  });

  const workStages = [
    { value: "NOT_STARTED", label: "Not Started", color: "#9CA3AF" },
    { value: "ASSESSMENT", label: "Assessment", color: "#F59E0B" },
    { value: "PLANNING", label: "Planning", color: "#3B82F6" },
    { value: "IN_PROGRESS", label: "In Progress", color: "#06B6D4" },
    { value: "QUALITY_CHECK", label: "Quality Check", color: "#8B5CF6" },
    { value: "COMPLETED", label: "Completed", color: "#10B981" },
    { value: "ON_HOLD", label: "On Hold", color: "#EF4444" },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all community reports
      const allReportsResponse = await reportService.getReports();
      const allReportsData =
        allReportsResponse?.data?.content || allReportsResponse?.data || [];
      setAllReports(allReportsData);

      // Fetch tasks assigned to this volunteer
      const myTasksResponse = await reportService.getAssignedReports();
      const myTasksData =
        myTasksResponse?.data?.content || myTasksResponse?.data || [];
      setMyTasks(myTasksData);

      // Fetch volunteer leaderboard
      await fetchVolunteerLeaderboard();

      // Calculate stats
      const statsData = {
        totalTasks: myTasksData.length,
        activeTasks: myTasksData.filter(
          (t) => t.status !== "RESOLVED" && t.status !== "REJECTED"
        ).length,
        completedTasks: myTasksData.filter(
          (t) => t.status === "RESOLVED" || t.workStage === "COMPLETED"
        ).length,
        communityReports: allReportsData.length,
        myImpact: myTasksData.filter(
          (t) => t.status === "RESOLVED" || t.workStage === "COMPLETED"
        ).length,
      };
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerLeaderboard = async () => {
    try {
      // Call the real backend endpoint using the service
      const response = await volunteerService.getVolunteerLeaderboard();
      setVolunteerLeaderboard(response.data || []);
    } catch (error) {
      console.error("Error fetching volunteer leaderboard:", error);
      // Fallback to empty array if API fails
      setVolunteerLeaderboard([]);
    }
  };

  const handleStartTask = async (reportId) => {
    try {
      // Start a task by assigning it to the current volunteer
      await reportService.assignReport(reportId, user.id);

      // Update the report locally to show it's now assigned
      setAllReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                assignedTo: user,
                status: "IN_PROGRESS",
                workStage: "ASSESSMENT",
              }
            : report
        )
      );

      toast.success("Task started successfully!");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error starting task:", error);
      toast.error("Failed to start task");
    }
  };

  const handleUpdateTaskProgress = async () => {
    if (!selectedTask) return;

    try {
      await reportService.updateReportProgress(
        selectedTask.id,
        progressPercentage,
        progressNotes,
        selectedWorkStage
      );

      toast.success("Task progress updated successfully");
      setShowTaskModal(false);
      setSelectedTask(null);
      setProgressNotes("");
      setProgressPercentage(0);
      setSelectedWorkStage("");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error updating task progress:", error);
      toast.error("Failed to update task progress");
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setProgressNotes(task.progressNotes || "");
    setProgressPercentage(task.progressPercentage || 0);
    setSelectedWorkStage(task.workStage || "NOT_STARTED");
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setProgressNotes("");
    setProgressPercentage(0);
    setSelectedWorkStage("");
  };

  const handleReportSelection = (reportId) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAllReports = () => {
    if (selectedReports.length === myTasks.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(myTasks.map((task) => task.id));
    }
  };

  const onExportComplete = () => {
    setSelectedReports([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "#F59E0B";
      case "IN_PROGRESS":
        return "#3B82F6";
      case "RESOLVED":
        return "#10B981";
      case "REJECTED":
        return "#EF4444";
      default:
        return "#9CA3AF";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "#EF4444";
      case "HIGH":
        return "#F59E0B";
      case "MEDIUM":
        return "#3B82F6";
      case "LOW":
        return "#10B981";
      default:
        return "#9CA3AF";
    }
  };

  const getWorkStageColor = (workStage) => {
    const stage = workStages.find((s) => s.value === workStage);
    return stage ? stage.color : "#9CA3AF";
  };

  if (loading) {
    return (
      <div className="volunteer-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading volunteer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-content">
          <h1>Volunteer Dashboard</h1>
          <p>
            Welcome back, {user?.fullName} • Community Hero • Making a
            difference together
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatCard
            icon={Target}
            title="Total Tasks"
            value={stats.totalTasks}
            color="#3B82F6"
            description="Tasks you've taken on"
          />
          <StatCard
            icon={Activity}
            title="Active Tasks"
            value={stats.activeTasks}
            color="#F59E0B"
            description="Currently working on"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completedTasks}
            color="#10B981"
            description="Successfully finished"
          />
          <StatCard
            icon={Users}
            title="Community Reports"
            value={stats.communityReports}
            color="#8B5CF6"
            description="Total community issues"
          />
          <StatCard
            icon={Trophy}
            title="My Impact"
            value={stats.myImpact}
            color="#EF4444"
            description="Issues you've resolved"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <div className="tab-list">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="tab-icon" />
              Overview
            </button>
            <button
              className={`tab-button ${
                activeTab === "community" ? "active" : ""
              }`}
              onClick={() => setActiveTab("community")}
            >
              <Users className="tab-icon" />
              Community Reports
            </button>
            <button
              className={`tab-button ${
                activeTab === "my-tasks" ? "active" : ""
              }`}
              onClick={() => setActiveTab("my-tasks")}
            >
              <FileText className="tab-icon" />
              My Tasks
            </button>
            <button
              className={`tab-button ${
                activeTab === "leaderboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("leaderboard")}
            >
              <Trophy className="tab-icon" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div>
              <div className="content-header">
                <h2 className="content-title">Volunteer Overview</h2>
                <p>Your community impact and available opportunities</p>
              </div>

              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Recent Community Reports</h3>
                  <div className="reports-preview">
                    {allReports.slice(0, 3).map((report) => (
                      <div key={report.id} className="report-preview-item">
                        <div className="report-preview-content">
                          <h4>{report.title}</h4>
                          <p>{report.description.substring(0, 100)}...</p>
                          <div className="report-preview-meta">
                            <span
                              className="priority-badge"
                              style={{
                                backgroundColor: getPriorityColor(
                                  report.priority
                                ),
                              }}
                            >
                              {report.priority}
                            </span>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(report.status),
                              }}
                            >
                              {report.status}
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStartTask(report.id)}
                          disabled={report.assignedTo}
                        >
                          {report.assignedTo
                            ? "Already Assigned"
                            : "Start Task"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overview-card">
                  <h3>My Active Tasks</h3>
                  <div className="tasks-preview">
                    {myTasks
                      .filter((t) => t.status !== "RESOLVED")
                      .slice(0, 3)
                      .map((task) => (
                        <div key={task.id} className="task-preview-item">
                          <div className="task-preview-content">
                            <h4>{task.title}</h4>
                            <div className="task-progress">
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${task.progressPercentage || 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span>{task.progressPercentage || 0}%</span>
                            </div>
                          </div>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openTaskModal(task)}
                          >
                            Update Progress
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "community" && (
            <div>
              <div className="content-header">
                <h2 className="content-title">Community Reports</h2>
                <p>Available issues you can help resolve</p>
              </div>

              <div className="reports-grid">
                {allReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-card-header">
                      <h3>{report.title}</h3>
                      <div className="report-meta">
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: getPriorityColor(report.priority),
                          }}
                        >
                          {report.priority}
                        </span>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(report.status),
                          }}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>

                    <div className="report-card-body">
                      <p>{report.description}</p>
                      <div className="report-details">
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{report.locationAddress}</span>
                        </div>
                        <div className="detail-item">
                          <User size={16} />
                          <span>
                            by {report.reporter?.fullName || "Anonymous"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <Calendar size={16} />
                          <span>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="report-card-actions">
                      {report.assignedTo ? (
                        <div className="assigned-info">
                          <User size={16} />
                          <span>Assigned to {report.assignedTo.fullName}</span>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleStartTask(report.id)}
                        >
                          <Play size={16} />
                          Start Task
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "my-tasks" && (
            <div>
              <div className="content-header">
                <div className="header-left">
                  <h2 className="content-title">My Tasks</h2>
                  <p>Track and manage your assigned tasks</p>
                </div>
                <div className="header-actions">
                  <ReportExporter
                    selectedReports={selectedReports}
                    allReports={myTasks}
                    userRole="volunteer"
                    onExportComplete={onExportComplete}
                    isExportMode={isExportMode}
                    onExportModeChange={setIsExportMode}
                  />
                  {isExportMode && myTasks.length > 0 && (
                    <button
                      onClick={handleSelectAllReports}
                      className="btn btn-secondary"
                      style={{ marginLeft: "10px" }}
                    >
                      {selectedReports.length === myTasks.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>
              </div>

              <div className="tasks-grid">
                {myTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-card-header">
                      <div className="task-header-left">
                        {isExportMode && (
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(task.id)}
                            onChange={() => handleReportSelection(task.id)}
                            className="task-checkbox"
                            style={{ marginRight: "10px" }}
                          />
                        )}
                        <h3>{task.title}</h3>
                      </div>
                      <div className="task-meta">
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: getPriorityColor(task.priority),
                          }}
                        >
                          {task.priority}
                        </span>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(task.status),
                          }}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>

                    <div className="task-card-body">
                      <p>{task.description}</p>

                      <div className="task-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${task.progressPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {task.progressPercentage || 0}%
                        </span>
                      </div>

                      <div className="task-details">
                        <div className="task-detail">
                          <MapPin size={16} />
                          <span>{task.locationAddress}</span>
                        </div>
                        <div className="task-detail">
                          <Calendar size={16} />
                          <span>
                            Created:{" "}
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {task.progressNotes && (
                        <div className="task-notes">
                          <p>
                            <strong>Progress Notes:</strong>{" "}
                            {task.progressNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="task-card-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => openTaskModal(task)}
                      >
                        <Edit3 size={16} />
                        Update Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div>
              <div className="content-header-with-certificate">
                <div>
                  <h2 className="content-title">Volunteer Leaderboard</h2>
                  <p>Top community heroes and their contributions</p>
                </div>
                <div className="certificate-section">
                  <span className="text-sm text-gray-600">
                    Download your certificate to showcase your achievements!
                  </span>
                </div>
              </div>

              <div className="leaderboard-container">
                <div className="leaderboard-header">
                  <div className="leaderboard-rank">Rank</div>
                  <div className="leaderboard-volunteer">Volunteer</div>
                  <div className="leaderboard-tasks">Completed Tasks</div>
                  <div className="leaderboard-success">Success Rate</div>
                  <div className="leaderboard-rating">Rating</div>
                  <div className="leaderboard-actions">Certificate</div>
                </div>

                {volunteerLeaderboard.map((volunteer, index) => (
                  <div
                    key={volunteer.id}
                    className={`leaderboard-row ${
                      index < 3 ? "top-three" : ""
                    }`}
                  >
                    <div className="leaderboard-rank">
                      {index === 0 && <Trophy size={20} color="#FFD700" />}
                      {index === 1 && <Trophy size={20} color="#C0C0C0" />}
                      {index === 2 && <Trophy size={20} color="#CD7F32" />}
                      <span className="rank-number">{index + 1}</span>
                    </div>
                    <div className="leaderboard-volunteer">
                      <div className="volunteer-avatar">{volunteer.avatar}</div>
                      <div className="volunteer-info">
                        <div className="volunteer-name">
                          {volunteer.fullName}
                        </div>
                        <div className="volunteer-status">
                          {index === 0
                            ? "🏆 Champion"
                            : index === 1
                            ? "🥈 Runner-up"
                            : index === 2
                            ? "🥉 Third Place"
                            : "Community Hero"}
                        </div>
                      </div>
                    </div>
                    <div className="leaderboard-tasks">
                      <div className="tasks-count">
                        {volunteer.completedTasks}
                      </div>
                      <div className="tasks-total">
                        / {volunteer.totalTasks}
                      </div>
                    </div>
                    <div className="leaderboard-success">
                      <div className="success-rate">
                        {volunteer.successRate}%
                      </div>
                    </div>
                    <div className="leaderboard-rating">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            color={
                              i < Math.floor(volunteer.rating)
                                ? "#FFD700"
                                : "#E5E7EB"
                            }
                            fill={
                              i < Math.floor(volunteer.rating)
                                ? "#FFD700"
                                : "none"
                            }
                          />
                        ))}
                      </div>
                      <div className="rating-value">{volunteer.rating}</div>
                    </div>
                    <div className="leaderboard-actions">
                      <VolunteerCertificate
                        volunteer={volunteer}
                        rank={index + 1}
                        onDownload={(fileName) => {
                          toast.success(`Certificate downloaded: ${fileName}`);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Progress Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={closeTaskModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Task Progress</h3>
              <button className="modal-close" onClick={closeTaskModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Progress Percentage</label>
                <div className="progress-input-group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) =>
                      setProgressPercentage(parseInt(e.target.value))
                    }
                    className="form-range"
                  />
                  <span className="progress-display">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Work Stage</label>
                <select
                  value={selectedWorkStage}
                  onChange={(e) => setSelectedWorkStage(e.target.value)}
                  className="form-select"
                >
                  {workStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Progress Notes</label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe what you've accomplished..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeTaskModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateTaskProgress}
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

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, color, description }) => (
  <div className="stat-card" style={{ "--card-color": color }}>
    <div className="stat-card-content">
      <div className="stat-card-info">
        <h3>{title}</h3>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-description">{description}</div>
      </div>
      <div className="stat-card-icon">
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default VolunteerDashboard;
