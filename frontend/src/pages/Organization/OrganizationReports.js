import React, { useState, useEffect } from "react";
import { FileText, Filter, Download, Search } from "lucide-react";
import { toast } from "react-toastify";
import ReportCard from "../../components/ReportCard/ReportCard";
import AssignmentModal from "../../components/Modals/AssignmentModal";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../contexts/AuthContext";
import "./OrganizationReports.css";

const OrganizationReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [assignmentModal, setAssignmentModal] = useState({
    isOpen: false,
    report: null,
  });

  const statusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" },
  ];

  const categoryOptions = [
    { value: "ALL", label: "All Categories" },
    { value: "INFRASTRUCTURE", label: "Infrastructure" },
    { value: "SAFETY", label: "Safety" },
    { value: "ENVIRONMENT", label: "Environment" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "TRANSPORTATION", label: "Transportation" },
    { value: "OTHER", label: "Other" },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, categoryFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getOrganizationReports(
        user.organizationId
      );
      const reportsData = response.data.content || response.data;
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reporter?.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(
        (report) => report.category === categoryFilter
      );
    }

    setFilteredReports(filtered);
  };

  const handleAssignReport = (report) => {
    console.log("OrganizationReports handleAssignReport called with:", report);
    setAssignmentModal({
      isOpen: true,
      report,
    });
  };

  const handleAssignmentComplete = () => {
    setAssignmentModal({
      isOpen: false,
      report: null,
    });
    fetchReports(); // Refresh reports after assignment
  };

  const exportReports = () => {
    // This would typically generate a CSV or PDF export
    toast.info("Export functionality coming soon");
  };

  const getStatusColor = (status) => {
    const colors = {
      SUBMITTED: "#fbbf24",
      UNDER_REVIEW: "#3b82f6",
      IN_PROGRESS: "#8b5cf6",
      RESOLVED: "#10b981",
      CLOSED: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="organization-reports">
        <div className="loading-spinner">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="organization-reports">
      <div className="reports-header">
        <div className="reports-title">
          <FileText className="icon" />
          <h1>All Organization Reports</h1>
        </div>
        <button className="btn btn-secondary" onClick={exportReports}>
          <Download className="btn-icon" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-number">{filteredReports.length}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {
              filteredReports.filter(
                (r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW"
              ).length
            }
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredReports.filter((r) => r.status === "IN_PROGRESS").length}
          </span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredReports.filter((r) => r.status === "RESOLVED").length}
          </span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-item">
            <ReportCard
              report={report}
              showAssignButton={true}
              onAssign={() => handleAssignReport(report)}
            />
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && !loading && (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <h3>No Reports Found</h3>
          <p>No reports match your current filters.</p>
        </div>
      )}

      {/* Assignment Modal */}
      {assignmentModal.isOpen && (
        <AssignmentModal
          isOpen={assignmentModal.isOpen}
          report={assignmentModal.report}
          onClose={() => setAssignmentModal({ isOpen: false, report: null })}
          onAssign={async (reportId, staffId) => {
            try {
              await reportService.assignReport(reportId, staffId);
              handleAssignmentComplete();
            } catch (error) {
              throw error;
            }
          }}
        />
      )}
    </div>
  );
};

export default OrganizationReports;
