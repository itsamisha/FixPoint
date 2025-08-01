package com.ambiguous.fixpoint.dto;

import com.ambiguous.fixpoint.entity.User;

import java.time.LocalDateTime;

public class UserSummary {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private Double latitude;
    private Double longitude;
    private User.Role role;
    private Boolean isVolunteer;
    private String volunteerSkills;
    private Boolean emailVerified;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Constructors
    public UserSummary() {}

    public UserSummary(Long id, String username, String email, String fullName, User.Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }

    public Boolean getIsVolunteer() { return isVolunteer; }
    public void setIsVolunteer(Boolean isVolunteer) { this.isVolunteer = isVolunteer; }

    public String getVolunteerSkills() { return volunteerSkills; }
    public void setVolunteerSkills(String volunteerSkills) { this.volunteerSkills = volunteerSkills; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
