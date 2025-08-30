package com.ambiguous.fixpoint.dto;

import com.ambiguous.fixpoint.entity.Organization;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrganizationRegistrationRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    private Organization.OrganizationType type;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 50)
    private String state;

    @Size(max = 20)
    private String zipCode;

    @Size(max = 50)
    private String country;

    @Size(max = 15)
    private String contactPhone;

    @NotBlank
    @Email
    @Size(max = 100)
    private String contactEmail;

    @Size(max = 255)
    private String website;

    private Double latitude;
    private Double longitude;

    @Size(max = 1000)
    private String serviceAreas;

    @Size(max = 1000)
    private String categories;

    // Admin user details
    @NotBlank
    @Size(max = 50)
    private String adminUsername;

    @NotBlank
    @Size(max = 100)
    private String adminFullName;

    @NotBlank
    @Email
    @Size(max = 100)
    private String adminEmail;

    @NotBlank
    @Size(max = 120)
    private String adminPassword;

    @NotBlank
    @Size(max = 120)
    private String confirmPassword;

    @Size(max = 100)
    private String adminJobTitle;

    @Size(max = 100)
    private String adminDepartment;

    @Size(max = 15)
    private String adminPhone;

    // Constructors
    public OrganizationRegistrationRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Organization.OrganizationType getType() { return type; }
    public void setType(Organization.OrganizationType type) { this.type = type; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getServiceAreas() { return serviceAreas; }
    public void setServiceAreas(String serviceAreas) { this.serviceAreas = serviceAreas; }

    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }

    public String getAdminUsername() { return adminUsername; }
    public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }

    public String getAdminFullName() { return adminFullName; }
    public void setAdminFullName(String adminFullName) { this.adminFullName = adminFullName; }

    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

    public String getAdminPassword() { return adminPassword; }
    public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getAdminJobTitle() { return adminJobTitle; }
    public void setAdminJobTitle(String adminJobTitle) { this.adminJobTitle = adminJobTitle; }

    public String getAdminDepartment() { return adminDepartment; }
    public void setAdminDepartment(String adminDepartment) { this.adminDepartment = adminDepartment; }

    public String getAdminPhone() { return adminPhone; }
    public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }
}
