package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "*")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<List<Organization>> getAllActiveOrganizations() {
        List<Organization> organizations = organizationService.getAllActiveOrganizations();
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Organization>> getOrganizationsByType(@PathVariable Organization.OrganizationType type) {
        List<Organization> organizations = organizationService.getOrganizationsByType(type);
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Organization>> getOrganizationsByCity(@PathVariable String city) {
        List<Organization> organizations = organizationService.getOrganizationsByCity(city);
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Organization>> searchOrganizations(@RequestParam String keyword) {
        List<Organization> organizations = organizationService.searchOrganizations(keyword);
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/service-area/{area}")
    public ResponseEntity<List<Organization>> getOrganizationsByServiceArea(@PathVariable String area) {
        List<Organization> organizations = organizationService.getOrganizationsByServiceArea(area);
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Organization>> getOrganizationsByCategory(@PathVariable String category) {
        List<Organization> organizations = organizationService.getOrganizationsByCategory(category);
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable Long id) {
        return organizationService.getOrganizationById(id)
                .map(organization -> ResponseEntity.ok(organization))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Organization> createOrganization(@Valid @RequestBody Organization organization) {
        try {
            Organization savedOrganization = organizationService.createOrganization(organization);
            return ResponseEntity.ok(savedOrganization);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORG_ADMIN')")
    public ResponseEntity<Organization> updateOrganization(@PathVariable Long id, @Valid @RequestBody Organization organizationDetails) {
        try {
            Organization updatedOrganization = organizationService.updateOrganization(id, organizationDetails);
            return ResponseEntity.ok(updatedOrganization);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrganization(@PathVariable Long id) {
        try {
            organizationService.deleteOrganization(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/types")
    public ResponseEntity<Organization.OrganizationType[]> getOrganizationTypes() {
        return ResponseEntity.ok(Organization.OrganizationType.values());
    }
}
