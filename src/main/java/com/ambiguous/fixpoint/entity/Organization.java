package com.ambiguous.fixpoint.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "organizations")
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(unique = true)
    private String name;

    @Size(max = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private OrganizationType type;

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

    @Size(max = 100)
    private String contactEmail;

    @Size(max = 255)
    private String website;

    private Double latitude;
    private Double longitude;

    @Size(max = 255)
    private String logoPath;

    private Boolean isActive = true;

    @Size(max = 1000)
    private String serviceAreas; // JSON string or comma-separated areas they serve

    @Size(max = 1000)
    private String categories; // JSON string or comma-separated categories they handle

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "targetOrganization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Report> assignedReports = new HashSet<>();

    // Constructors
    public Organization() {}

    public Organization(String name, OrganizationType type, String contactEmail) {
        this.name = name;
        this.type = type;
        this.contactEmail = contactEmail;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OrganizationType getType() { return type; }
    public void setType(OrganizationType type) { this.type = type; }

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

    public String getLogoPath() { return logoPath; }
    public void setLogoPath(String logoPath) { this.logoPath = logoPath; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getServiceAreas() { return serviceAreas; }
    public void setServiceAreas(String serviceAreas) { this.serviceAreas = serviceAreas; }

    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<User> getUsers() { return users; }
    public void setUsers(Set<User> users) { this.users = users; }

    public Set<Report> getAssignedReports() { return assignedReports; }
    public void setAssignedReports(Set<Report> assignedReports) { this.assignedReports = assignedReports; }

    public enum OrganizationType {
        CITY_CORPORATION,
        MUNICIPALITY,
        GOVERNMENT_OFFICE,
        NGO,
        PRIVATE_CONTRACTOR,
        UTILITY_COMPANY,
        POLICE_STATION,
        FIRE_DEPARTMENT,
        HEALTH_DEPARTMENT,
        EDUCATION_DEPARTMENT,
        TRANSPORT_AUTHORITY,
        ENVIRONMENTAL_AGENCY,
        OTHER
    }
}
