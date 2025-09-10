package com.ambiguous.fixpoint.dto;

import com.ambiguous.fixpoint.entity.Report;

import java.time.LocalDateTime;

public class ReportSummary {
    private Long id;
    private String title;
    private String description;
    private Report.Category category;
    private Report.Status status;
    private Report.Priority priority;
    private Double latitude;
    private Double longitude;
    private String locationAddress;
    private String imagePath;
    private String resolutionImagePath;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private Integer voteCount;
    private UserSummary reporter;
    private UserSummary assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer commentCount;
    private Boolean hasUserVoted;
    
    // Progress tracking fields
    private Integer progressPercentage;
    private String progressNotes;
    private LocalDateTime progressUpdatedAt;
    private Report.WorkStage workStage;

    // Constructors
    public ReportSummary() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Report.Category getCategory() { return category; }
    public void setCategory(Report.Category category) { this.category = category; }

    public Report.Status getStatus() { return status; }
    public void setStatus(Report.Status status) { this.status = status; }

    public Report.Priority getPriority() { return priority; }
    public void setPriority(Report.Priority priority) { this.priority = priority; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getResolutionImagePath() { return resolutionImagePath; }
    public void setResolutionImagePath(String resolutionImagePath) { this.resolutionImagePath = resolutionImagePath; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public Integer getVoteCount() { return voteCount; }
    public void setVoteCount(Integer voteCount) { this.voteCount = voteCount; }

    public UserSummary getReporter() { return reporter; }
    public void setReporter(UserSummary reporter) { this.reporter = reporter; }

    public UserSummary getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UserSummary assignedTo) { this.assignedTo = assignedTo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getCommentCount() { return commentCount; }
    public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }

    public Boolean getHasUserVoted() { return hasUserVoted; }
    public void setHasUserVoted(Boolean hasUserVoted) { this.hasUserVoted = hasUserVoted; }

    // Progress tracking getters and setters
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getProgressNotes() { return progressNotes; }
    public void setProgressNotes(String progressNotes) { this.progressNotes = progressNotes; }

    public LocalDateTime getProgressUpdatedAt() { return progressUpdatedAt; }
    public void setProgressUpdatedAt(LocalDateTime progressUpdatedAt) { this.progressUpdatedAt = progressUpdatedAt; }

    public Report.WorkStage getWorkStage() { return workStage; }
    public void setWorkStage(Report.WorkStage workStage) { this.workStage = workStage; }
}
