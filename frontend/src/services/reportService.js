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
        if (key === "targetOrganizationIds" && Array.isArray(reportData[key])) {
          // Handle array of organization IDs
          reportData[key].forEach((id, index) => {
            formData.append(`targetOrganizationIds[${index}]`, id);
          });
        } else {
          formData.append(key, reportData[key]);
        }
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

  // Check for duplicate reports
  checkDuplicates: (reportData) => {
    return api.post("/api/reports/check-duplicates", reportData);
  },

  // Get user's reports
  getUserReports: (params = {}) => {
    return api.get("/api/reports/my-reports", { params });
  },

  // Get reports assigned to current user
  getAssignedReports: (params = {}) => {
    return api.get("/api/reports/assigned", { params });
  },

  // Get reports for a specific organization (admin only)
  getOrganizationReports: (organizationId, params = {}) => {
    return api.get(`/api/reports/organization/${organizationId}`, { params });
  },

  // Assign a report to a staff member (admin only)
  assignReport: (reportId, staffMemberId) => {
    return api.put(`/api/reports/${reportId}/assign-staff`, {
      assignedToId: staffMemberId,
    });
  },

  // Update report status
  updateReportStatus: (reportId, status, resolutionNotes) => {
    return api.put(`/api/reports/${reportId}/status`, null, {
      params: { status, resolutionNotes },
    });
  },

  // Get reports in area
  getReportsInArea: (bounds) => {
    return api.get("/api/reports/area", { params: bounds });
  },

  // Vote for report
  voteForReport: (reportId) => {
    return api.post(`/api/reports/${reportId}/vote`);
  },

  // Update report status (admin only) - with parameters
  updateReportStatusWithParams: (reportId, status, resolutionNotes) => {
    return api.put(`/api/reports/${reportId}/status`, null, {
      params: { status, resolutionNotes },
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

  // Get organizations
  getOrganizations: () => {
    return publicApi.get("/api/organizations");
  },

  // Analyze image with AI
  analyzeImage: (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    return api.post("/api/ai/analyze-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Enhanced AI analysis with category-specific prompts
  analyzeImageEnhanced: (imageFile, category) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("category", category);

    return api.post("/api/ai/analyze-image-enhanced", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get AI capabilities
  getAICapabilities: () => {
    return api.get("/api/ai/capabilities");
  },

  // Comments functionality
  // Get comments for a report
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

  // Toggle reaction on a comment
  toggleReaction: (reportId, commentId, type) => {
    return api.post(
      `/api/reports/${reportId}/comments/${commentId}/reactions`,
      { type }
    );
  },

  // Get replies for a comment (alias for backward compatibility)
  getReplies: (reportId, commentId) => {
    return api.get(`/api/reports/${reportId}/comments/${commentId}/replies`);
  },

  // Get replies for a comment
  getCommentReplies: (reportId, commentId) => {
    return api.get(`/api/reports/${reportId}/comments/${commentId}/replies`);
  },

  // Progress tracking methods
  updateReportProgress: (
    reportId,
    progressPercentage,
    progressNotes,
    workStage
  ) => {
    const progressData = {
      progressPercentage: progressPercentage,
      progressNotes: progressNotes,
      workStage: workStage,
    };
    return api.put(`/api/reports/${reportId}/progress`, progressData);
  },

  // Get reports assigned to current user
  getMyAssignedReports: (params = {}) => {
    return api.get("/api/reports/assigned/me", { params });
  },

  // Translate text to Bangla using AI
  translateText: (text, targetLanguage = "bangla") => {
    return api.post("/api/ai/translate", {
      text: text,
      targetLanguage: targetLanguage,
    });
  },

  // Assign report to a volunteer or staff member
  assignReport: (reportId, userId) => {
    return api.put(`/api/reports/${reportId}/assign`, { assignedToId: userId });
  },
};
