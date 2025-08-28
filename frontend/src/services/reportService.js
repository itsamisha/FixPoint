import api, { publicApi } from "./api";

export const reportService = {
  // Get all reports
  getReports: (params = {}) => {
    return api.get("/api/reports", { params });
  },

  // Get public reports
  getPublicReports: (params = {}) => {
    console.log("Fetching public reports with params:", params);
    return publicApi.get("/api/public/reports", { params }).catch((error) => {
      console.error("API Error in getPublicReports:", error.response || error);
      throw error;
    });
  },

  // Get report by ID
  getReportById: (id) => {
    return api.get(`/api/reports/${id}`);
  },

  // Create new report
  createReport: (reportData, image) => {
    const formData = new FormData();

    // Append report data
    Object.keys(reportData).forEach((key) => {
      if (reportData[key] !== null && reportData[key] !== undefined) {
        formData.append(key, reportData[key]);
      }
    });

    // Append image if provided
    if (image) {
      formData.append("image", image);
    }

    return api.post("/api/reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get user's reports
  getUserReports: (params = {}) => {
    return api.get("/api/reports/my-reports", { params });
  },

  // Get reports in area
  getReportsInArea: (bounds) => {
    return api.get("/api/reports/area", { params: bounds });
  },

  // Vote for report
  voteForReport: (reportId) => {
    return api.post(`/api/reports/${reportId}/vote`);
  },

  // Update report status (admin only)
  updateReportStatus: (reportId, status, resolutionNotes) => {
    return api.put(`/api/reports/${reportId}/status`, null, {
      params: { status, resolutionNotes },
    });
  },

  // Assign report (admin only)
  assignReport: (reportId, assigneeId) => {
    return api.put(`/api/reports/${reportId}/assign`, null, {
      params: { assigneeId },
    });
  },

  // Get report categories
  getCategories: () => {
    return publicApi.get("/api/public/reports/categories");
  },

  // Get report statuses
  getStatuses: () => {
    return publicApi.get("/api/public/reports/statuses");
  },

  // Get report priorities
  getPriorities: () => {
    return publicApi.get("/api/public/reports/priorities");
  },

  // List comments for a report
  getComments: (reportId) => {
    return api.get(`/api/reports/${reportId}/comments`);
  },

  // Add a comment to a report
  addComment: (reportId, content) => {
    return api.post(`/api/reports/${reportId}/comments`, { content });
  },

  // Add a reply to a comment
  addReply: (reportId, commentId, content) => {
    return api.post(`/api/reports/${reportId}/comments/${commentId}/replies`, {
      content,
    });
  },

  // Get replies for a comment
  getReplies: (reportId, commentId) => {
    return api.get(`/api/reports/${reportId}/comments/${commentId}/replies`);
  },

  // Toggle reaction on a comment
  toggleReaction: (reportId, commentId, reactionType) => {
    return api.post(
      `/api/reports/${reportId}/comments/${commentId}/reactions`,
      { type: reactionType }
    );
  },
};
