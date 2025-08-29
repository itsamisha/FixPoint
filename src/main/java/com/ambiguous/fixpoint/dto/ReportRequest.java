package com.ambiguous.fixpoint.dto;

import com.ambiguous.fixpoint.entity.Report;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ReportRequest {
    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 2000)
    private String description;

    @NotNull
    private Report.Category category;

    private Report.Priority priority = Report.Priority.MEDIUM;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @Size(max = 255)
    private String locationAddress;

    private List<Long> targetOrganizationIds;

    private Boolean notifyVolunteers = false;

    // Constructors
    public ReportRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Report.Category getCategory() { return category; }
    public void setCategory(Report.Category category) { this.category = category; }

    public Report.Priority getPriority() { return priority; }
    public void setPriority(Report.Priority priority) { this.priority = priority; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public List<Long> getTargetOrganizationIds() { return targetOrganizationIds; }
    public void setTargetOrganizationIds(List<Long> targetOrganizationIds) { this.targetOrganizationIds = targetOrganizationIds; }

    public Boolean getNotifyVolunteers() { return notifyVolunteers; }
    public void setNotifyVolunteers(Boolean notifyVolunteers) { this.notifyVolunteers = notifyVolunteers; }
}
