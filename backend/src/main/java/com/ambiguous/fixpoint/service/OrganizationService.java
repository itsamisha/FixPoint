package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    public List<Organization> getAllActiveOrganizations() {
        return organizationRepository.findByIsActiveTrue();
    }

    public List<Organization> getOrganizationsByType(Organization.OrganizationType type) {
        return organizationRepository.findByTypeAndIsActiveTrue(type);
    }

    public List<Organization> getOrganizationsByCity(String city) {
        return organizationRepository.findByCityAndIsActiveTrue(city);
    }

    public List<Organization> getOrganizationsByServiceArea(String area) {
        return organizationRepository.findByServiceArea(area);
    }

    public List<Organization> getOrganizationsByCategory(String category) {
        return organizationRepository.findByCategory(category);
    }

    public List<Organization> searchOrganizations(String keyword) {
        return organizationRepository.searchByKeyword(keyword);
    }

    public Optional<Organization> getOrganizationById(Long id) {
        return organizationRepository.findById(id);
    }

    public Optional<Organization> getOrganizationByName(String name) {
        return organizationRepository.findByName(name);
    }

    public Organization saveOrganization(Organization organization) {
        return organizationRepository.save(organization);
    }

    public Organization createOrganization(Organization organization) {
        if (organizationRepository.existsByName(organization.getName())) {
            throw new RuntimeException("Organization with this name already exists");
        }
        if (organizationRepository.existsByContactEmail(organization.getContactEmail())) {
            throw new RuntimeException("Organization with this email already exists");
        }
        return organizationRepository.save(organization);
    }

    public Organization updateOrganization(Long id, Organization organizationDetails) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));

        organization.setName(organizationDetails.getName());
        organization.setDescription(organizationDetails.getDescription());
        organization.setType(organizationDetails.getType());
        organization.setAddress(organizationDetails.getAddress());
        organization.setCity(organizationDetails.getCity());
        organization.setState(organizationDetails.getState());
        organization.setZipCode(organizationDetails.getZipCode());
        organization.setCountry(organizationDetails.getCountry());
        organization.setContactPhone(organizationDetails.getContactPhone());
        organization.setContactEmail(organizationDetails.getContactEmail());
        organization.setWebsite(organizationDetails.getWebsite());
        organization.setLatitude(organizationDetails.getLatitude());
        organization.setLongitude(organizationDetails.getLongitude());
        organization.setServiceAreas(organizationDetails.getServiceAreas());
        organization.setCategories(organizationDetails.getCategories());
        organization.setIsActive(organizationDetails.getIsActive());

        return organizationRepository.save(organization);
    }

    public void deleteOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
        organization.setIsActive(false);
        organizationRepository.save(organization);
    }

    public boolean existsByName(String name) {
        return organizationRepository.existsByName(name);
    }

    public boolean existsByEmail(String email) {
        return organizationRepository.existsByContactEmail(email);
    }
}
