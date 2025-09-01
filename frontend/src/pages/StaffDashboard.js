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
} from "lucide-react";
import { toast } from "react-toastify";
import { reportService } from "../services/reportService";
import { useAuth } from "../contexts/AuthContext";
import ReportExporter from "../components/ReportExporter";
import "./StaffDashboard.css";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
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
    totalAssigned: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const fetchAssignedTasks = async () => {
    setLoading(true);
    try {
      const response = await reportService.getAssignedReports();
      const tasks = response.data.content || response.data;
      setAssignedTasks(tasks);

      // Calculate stats
      const statsData = {
        totalAssigned: tasks.length,
        notStarted: tasks.filter(
          (t) => t.workStage === "NOT_STARTED" || t.status === "SUBMITTED"
        ).length,
        inProgress: tasks.filter(
          (t) => t.status === "IN_PROGRESS" && t.workStage !== "COMPLETED"
        ).length,
        completed: tasks.filter(
          (t) => t.status === "RESOLVED" || t.workStage === "COMPLETED"
        ).length,
        overdue: tasks.filter((t) => {
          const daysSinceAssignment = Math.floor(
            (new Date() - new Date(t.createdAt)) / (1000 * 60 * 60 * 24)
          );
          return daysSinceAssignment > 7 && t.status !== "RESOLVED";
        }).length,
      };
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      toast.error("Failed to load assigned tasks");
    } finally {
      setLoading(false);
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
      fetchAssignedTasks(); // Refresh data
    } catch (error) {
      console.error("Error updating task progress:", error);
      toast.error("Failed to update task progress");
    }
  };

  const handleQuickAction = async (taskId, action) => {
    try {
      let newStatus, newWorkStage, newProgress;

      switch (action) {
        case "start":
          newStatus = "IN_PROGRESS";
          newWorkStage = "ASSESSMENT";
          newProgress = 10;
          break;
        case "progress":
          newWorkStage = "IN_PROGRESS";
          newProgress = 50;
          break;
        case "complete":
          newStatus = "RESOLVED";
          newWorkStage = "COMPLETED";
          newProgress = 100;
          break;
        default:
          return;
      }

      await reportService.updateReportProgress(
        taskId,
        newProgress,
        "",
        newWorkStage
      );
      if (newStatus) {
        await reportService.updateReportStatus(taskId, newStatus);
      }

      toast.success(`Task ${action}ed successfully`);
      fetchAssignedTasks();
    } catch (error) {
      console.error("Error performing quick action:", error);
      toast.error("Failed to update task");
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setProgressPercentage(task.progressPercentage || 0);
    setProgressNotes(task.progressNotes || "");
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

  const getTaskStatusColor = (status, workStage) => {
    if (status === "RESOLVED" || workStage === "COMPLETED")
      return "bg-green-100 text-green-800";
    if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkStageIcon = (workStage) => {
    switch (workStage) {
      case "NOT_STARTED":
        return <Clock className="w-4 h-4" />;
      case "ASSESSMENT":
        return <AlertCircle className="w-4 h-4" />;
      case "PLANNING":
        return <Target className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Activity className="w-4 h-4" />;
      case "QUALITY_CHECK":
        return <CheckSquare className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "ON_HOLD":
        return <Pause className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, description }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card-content">
        <div className="stat-card-info">
          <h3>{title}</h3>
          <div className="stat-card-value" style={{ color }}>
            {value}
          </div>
          {description && (
            <p className="stat-card-description">{description}</p>
          )}
        </div>
        <Icon className="stat-card-icon" style={{ color }} />
      </div>
    </div>
  );

  const TaskCard = ({ task }) => (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-card-title">
          <h4>{task.title}</h4>
          <div className="task-card-meta">
            <span
              className={`priority-badge ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </span>
            <span
              className={`status-badge ${getTaskStatusColor(
                task.status,
                task.workStage
              )}`}
            >
              {task.workStage
                ? task.workStage.replace(/_/g, " ")
                : task.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <div className="task-card-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${task.progressPercentage || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">{task.progressPercentage || 0}%</span>
        </div>
      </div>

      <div className="task-card-body">
        <p className="task-description">{task.description}</p>
        <div className="task-details">
          <div className="task-detail">
            <MapPin className="w-4 h-4" />
            <span>{task.locationAddress}</span>
          </div>
          <div className="task-detail">
            <Calendar className="w-4 h-4" />
            <span>
              Assigned: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="task-detail">
            <User className="w-4 h-4" />
            <span>Reporter: {task.reporter?.fullName}</span>
          </div>
        </div>

        {task.progressNotes && (
          <div className="task-notes">
            <p>
              <strong>Progress Notes:</strong> {task.progressNotes}
            </p>
          </div>
        )}
      </div>

      <div className="task-card-actions">
        <button
          onClick={() => openTaskModal(task)}
          className="btn btn-outline btn-sm"
        >
          Update Progress
        </button>

        {task.status === "SUBMITTED" && (
          <button
            onClick={() => handleQuickAction(task.id, "start")}
            className="btn btn-primary btn-sm"
          >
            <Play className="w-4 h-4" />
            Start Work
          </button>
        )}

        {task.status === "IN_PROGRESS" && task.workStage === "ASSESSMENT" && (
          <button
            onClick={() => handleQuickAction(task.id, "progress")}
            className="btn btn-success btn-sm"
          >
            <Activity className="w-4 h-4" />
            Continue Work
          </button>
        )}

        {task.status === "IN_PROGRESS" &&
          task.workStage === "QUALITY_CHECK" && (
            <button
              onClick={() => handleQuickAction(task.id, "complete")}
              className="btn btn-success btn-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
          )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your tasks...</p>
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
            Welcome back, {user?.fullName} • {user?.jobTitle} •{" "}
            {user?.department}
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatCard
            icon={FileText}
            title="Total Assigned"
            value={stats.totalAssigned}
            color="#3B82F6"
            description="Tasks assigned to you"
          />
          <StatCard
            icon={Clock}
            title="Not Started"
            value={stats.notStarted}
            color="#F59E0B"
            description="Awaiting initiation"
          />
          <StatCard
            icon={Activity}
            title="In Progress"
            value={stats.inProgress}
            color="#06B6D4"
            description="Currently working"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completed}
            color="#10B981"
            description="Successfully finished"
          />
          <StatCard
            icon={AlertCircle}
            title="Overdue"
            value={stats.overdue}
            color="#EF4444"
            description="Past due date"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <div className="tab-list">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "assigned", label: "Assigned Tasks", icon: FileText },
              { id: "in-progress", label: "In Progress", icon: Activity },
              { id: "completed", label: "Completed", icon: CheckCircle },
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
              <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Recent Tasks</h3>
                  {assignedTasks.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {assignedTasks.slice(0, 3).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      <button
                        onClick={() => setActiveTab("assigned")}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all tasks →
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No tasks assigned to you yet.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Task Progress Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="progress-summary">
                      <div className="progress-item">
                        <span>Not Started</span>
                        <div className="progress-bar-small">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${
                                stats.totalAssigned > 0
                                  ? (stats.notStarted / stats.totalAssigned) *
                                    100
                                  : 0
                              }%`,
                              backgroundColor: "#F59E0B",
                            }}
                          ></div>
                        </div>
                        <span>{stats.notStarted}</span>
                      </div>
                      <div className="progress-item">
                        <span>In Progress</span>
                        <div className="progress-bar-small">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${
                                stats.totalAssigned > 0
                                  ? (stats.inProgress / stats.totalAssigned) *
                                    100
                                  : 0
                              }%`,
                              backgroundColor: "#06B6D4",
                            }}
                          ></div>
                        </div>
                        <span>{stats.inProgress}</span>
                      </div>
                      <div className="progress-item">
                        <span>Completed</span>
                        <div className="progress-bar-small">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${
                                stats.totalAssigned > 0
                                  ? (stats.completed / stats.totalAssigned) *
                                    100
                                  : 0
                              }%`,
                              backgroundColor: "#10B981",
                            }}
                          ></div>
                        </div>
                        <span>{stats.completed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "assigned" && (
            <div className="p-6">
              <div className="content-header">
                <h2 className="content-title">All Assigned Tasks</h2>
                <p className="text-gray-600">
                  Manage all tasks assigned to you
                </p>
              </div>

              {assignedTasks.length > 0 ? (
                <div className="tasks-grid">
                  {assignedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FileText className="empty-state-icon" />
                  <h3 className="empty-state-title">No assigned tasks</h3>
                  <p className="empty-state-description">
                    Tasks assigned to you will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "in-progress" && (
            <div className="p-6">
              <div className="content-header">
                <h2 className="content-title">Tasks In Progress</h2>
                <p className="text-gray-600">
                  Tasks you're currently working on
                </p>
              </div>

              {assignedTasks.filter(
                (task) =>
                  task.status === "IN_PROGRESS" &&
                  task.workStage !== "COMPLETED"
              ).length > 0 ? (
                <div className="tasks-grid">
                  {assignedTasks
                    .filter(
                      (task) =>
                        task.status === "IN_PROGRESS" &&
                        task.workStage !== "COMPLETED"
                    )
                    .map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Activity className="empty-state-icon" />
                  <h3 className="empty-state-title">No tasks in progress</h3>
                  <p className="empty-state-description">
                    Start working on your assigned tasks to see them here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="p-6">
              <div className="content-header">
                <h2 className="content-title">Completed Tasks</h2>
                <p className="text-gray-600">
                  Tasks you've successfully completed
                </p>
              </div>

              {assignedTasks.filter(
                (task) =>
                  task.status === "RESOLVED" || task.workStage === "COMPLETED"
              ).length > 0 ? (
                <div className="tasks-grid">
                  {assignedTasks
                    .filter(
                      (task) =>
                        task.status === "RESOLVED" ||
                        task.workStage === "COMPLETED"
                    )
                    .map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                </div>
              ) : (
                <div className="empty-state">
                  <CheckCircle className="empty-state-icon" />
                  <h3 className="empty-state-title">No completed tasks</h3>
                  <p className="empty-state-description">
                    Completed tasks will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Task Progress Modal */}
        {showTaskModal && selectedTask && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Update Task Progress</h3>
                <button onClick={closeTaskModal} className="modal-close">
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Task Title</label>
                  <p className="form-text">{selectedTask.title}</p>
                </div>

                <div className="form-group">
                  <label>Progress Percentage</label>
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

                <div className="form-group">
                  <label>Work Stage</label>
                  <select
                    value={selectedWorkStage}
                    onChange={(e) => setSelectedWorkStage(e.target.value)}
                    className="form-select"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="ASSESSMENT">Assessment</option>
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="QUALITY_CHECK">Quality Check</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Progress Notes</label>
                  <textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Add notes about the current progress..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeTaskModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTaskProgress}
                  className="btn btn-primary"
                >
                  Update Progress
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
