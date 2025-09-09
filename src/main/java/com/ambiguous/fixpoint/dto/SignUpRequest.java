
package com.ambiguous.fixpoint.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.ambiguous.fixpoint.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SignUpRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Size(max = 100)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    @Size(min = 6, max = 40)
    private String confirmPassword;

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Size(max = 15)
    private String phone;

    @Size(max = 255)
    private String address;

    private Double latitude;
    private Double longitude;
    private Boolean isVolunteer = false;

    @Size(max = 500)
    private String volunteerSkills;

    // Organization-related fields for organization staff registration
    private Long organizationId;
    
    @Size(max = 100)
    private String jobTitle;
    
    @Size(max = 100)
    private String department;
    
    @Size(max = 50)
    private String employeeId;
    
    private User.UserType userType = User.UserType.CITIZEN;

    // Constructors
    public SignUpRequest() {}

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

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

    public Boolean getIsVolunteer() { return isVolunteer; }
    public void setIsVolunteer(Boolean isVolunteer) { this.isVolunteer = isVolunteer; }

    public String getVolunteerSkills() { return volunteerSkills; }
    public void setVolunteerSkills(String volunteerSkills) { this.volunteerSkills = volunteerSkills; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public User.UserType getUserType() { return userType; }
    public void setUserType(User.UserType userType) { this.userType = userType; }
}
