import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/apiConfig";
import {
  Eye,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  UserPlus,
} from "lucide-react";
import "./ReportCard.css";

const ReportCard = ({
  report,
  onVote,
  showVoteButton = false,
  showAssignButton = false,
  onAssign,
}) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "status-submitted";
      case "in_progress":
        return "status-in_progress";
      case "resolved":
        return "status-resolved";
      case "rejected":
        return "status-rejected";
      default:
        return "status-submitted";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      case "urgent":
        return "priority-urgent";
      default:
        return "priority-medium";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCategory = (category) => {
    return category
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleVote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onVote) {
      onVote(report.id);
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ReportCard handleAssign called with report:", report);
    if (onAssign) {
      console.log("Calling onAssign function");
      onAssign(report);
    } else {
      console.log("onAssign function is not provided");
    }
  };

  return (
    <div className="report-card">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <h3 className="card-title">{report.title}</h3>
          <div className="flex gap-2">
            <span className={`status-badge ${getStatusClass(report.status)}`}>
              {report.status?.replace(/_/g, " ")}
            </span>
            <span
              className={`priority-badge ${getPriorityClass(report.priority)}`}
            >
              {report.priority}
            </span>
          </div>
        </div>

        <p
          className="text-gray-600 mb-4"
          style={{ maxHeight: "60px", overflow: "hidden" }}
        >
          {report.description}
        </p>

        {report.imagePath && (
          <div className="mb-4">
            <img
              src={getImageUrl(report.imagePath)}
              alt="Report"
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{formatCategory(report.category)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{formatDate(report.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>
              {report.reporter?.fullName || report.reporter?.username}
            </span>
          </div>
          {report.assignedTo && (
            <div className="flex items-center gap-1 text-blue-600">
              <UserPlus size={16} />
              <span>
                Assigned to:{" "}
                {report.assignedTo.fullName || report.assignedTo.username}
              </span>
            </div>
          )}
        </div>

        {report.locationAddress && (
          <div className="text-sm text-gray-500 mb-4">
            <MapPin size={16} className="inline mr-1" />
            {report.locationAddress}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <ThumbsUp size={16} />
              <span>{report.voteCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={16} />
              <span>{report.commentCount || 0}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {showVoteButton && (
              <button
                onClick={handleVote}
                className={`btn ${
                  report.hasUserVoted ? "btn-primary" : "btn-outline"
                }`}
              >
                <ThumbsUp size={16} />
                {report.hasUserVoted ? "Voted" : "Vote"}
              </button>
            )}
            {showAssignButton && (
              <button
                onClick={handleAssign}
                className="btn btn-success"
                title="Assign to Staff"
              >
                <UserPlus size={16} />
                {report.assignedTo ? "Reassign" : "Assign"}
              </button>
            )}
            <Link to={`/reports/${report.id}`} className="btn btn-outline">
              <Eye size={16} />
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
