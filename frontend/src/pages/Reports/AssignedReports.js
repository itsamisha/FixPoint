import React, { useState, useEffect } from "react";
import { UserCog, Clock, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import ReportCard from "../../components/ReportCard/ReportCard";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../contexts/AuthContext";
import "./AssignedReports.css";

const AssignedReports = () => {
  const { user } = useAuth();
  const [assignedReports, setAssignedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const statusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const fetchAssignedReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAssignedReports();
      const reportsData = response.data.content || response.data;
      setAssignedReports(reportsData);
    } catch (error) {
      console.error("Error fetching assigned reports:", error);
      toast.error("Failed to load assigned reports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await reportService.updateReportStatus(reportId, newStatus);
      toast.success("Report status updated successfully");
      fetchAssignedReports(); // Refresh the list
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    }
  };

  const filteredReports =
    statusFilter === "ALL"
      ? assignedReports
      : assignedReports.filter((report) => report.status === statusFilter);

  if (loading) {
    return (
      <div className="assigned-reports">
        <div className="loading-spinner">Loading assigned reports...</div>
      </div>
    );
  }

  return (
    <div className="assigned-reports">
      <div className="reports-header">
        <div className="reports-title">
          <UserCog className="icon" />
          <h1>My Assigned Reports</h1>
        </div>

        <div className="filter-control">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock className="icon" />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {
                assignedReports.filter(
                  (r) =>
                    r.status === "UNDER_REVIEW" || r.status === "IN_PROGRESS"
                ).length
              }
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle className="icon" />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {assignedReports.filter((r) => r.status === "RESOLVED").length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <UserCog className="icon" />
          </div>
          <div className="stat-content">
            <span className="stat-number">{assignedReports.length}</span>
            <span className="stat-label">Total Assigned</span>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-item">
            <ReportCard
              report={report}
              showStatusUpdate={true}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && !loading && (
        <div className="empty-state">
          <UserCog className="empty-icon" />
          <h3>No Assigned Reports</h3>
          <p>
            {statusFilter === "ALL"
              ? "You don't have any reports assigned to you yet."
              : `No reports with status "${
                  statusOptions.find((opt) => opt.value === statusFilter)?.label
                }" found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignedReports;
