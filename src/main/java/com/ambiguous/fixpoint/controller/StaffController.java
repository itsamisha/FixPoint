package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.repository.OrganizationRepository;
import com.ambiguous.fixpoint.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    /**
     * Get all staff members for the current user's organization
     */
    @GetMapping("/organization")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getOrganizationStaff(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findByIdWithOrganization(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getOrganization() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "User is not associated with any organization"));
            }

            // Only organization admins can view all staff
            if (!user.getUserType().equals(User.UserType.ORGANIZATION_ADMIN)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            List<User> staffMembers = userRepository.findByOrganizationAndUserType(
                user.getOrganization(), User.UserType.ORGANIZATION_STAFF);
            
            // Convert to DTOs to avoid circular references
            List<Map<String, Object>> staffDTOs = staffMembers.stream().map(staff -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", staff.getId());
                dto.put("username", staff.getUsername());
                dto.put("fullName", staff.getFullName());
                dto.put("email", staff.getEmail());
                dto.put("phone", staff.getPhone());
                dto.put("jobTitle", staff.getJobTitle());
                dto.put("department", staff.getDepartment());
                dto.put("employeeId", staff.getEmployeeId());
                dto.put("isActive", staff.getIsActive());
                dto.put("createdAt", staff.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(staffDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error fetching staff: " + e.getMessage()));
        }
    }

    /**
     * Get staff members by organization ID (for system admins)
     */
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<?> getStaffByOrganization(
            @PathVariable Long organizationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findByIdWithOrganization(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has permission to view this organization's staff
            if (!user.getUserType().equals(User.UserType.ORGANIZATION_ADMIN) || 
                !user.getOrganization().getId().equals(organizationId)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            Organization organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            List<User> staffMembers = userRepository.findByOrganizationAndUserType(
                organization, User.UserType.ORGANIZATION_STAFF);
            
            // Convert to DTOs
            List<Map<String, Object>> staffDTOs = staffMembers.stream().map(staff -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", staff.getId());
                dto.put("username", staff.getUsername());
                dto.put("fullName", staff.getFullName());
                dto.put("email", staff.getEmail());
                dto.put("phone", staff.getPhone());
                dto.put("jobTitle", staff.getJobTitle());
                dto.put("department", staff.getDepartment());
                dto.put("employeeId", staff.getEmployeeId());
                dto.put("isActive", staff.getIsActive());
                dto.put("createdAt", staff.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(staffDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error fetching staff: " + e.getMessage()));
        }
    }

    /**
     * Get staff member by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User currentUserEntity = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            User staff = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Staff member not found"));

            // Check if user has permission to view this staff member
            if (!currentUserEntity.getUserType().equals(User.UserType.ORGANIZATION_ADMIN) || 
                !currentUserEntity.getOrganization().equals(staff.getOrganization())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            Map<String, Object> staffDTO = new HashMap<>();
            staffDTO.put("id", staff.getId());
            staffDTO.put("username", staff.getUsername());
            staffDTO.put("fullName", staff.getFullName());
            staffDTO.put("email", staff.getEmail());
            staffDTO.put("phone", staff.getPhone());
            staffDTO.put("jobTitle", staff.getJobTitle());
            staffDTO.put("department", staff.getDepartment());
            staffDTO.put("employeeId", staff.getEmployeeId());
            staffDTO.put("isActive", staff.getIsActive());
            staffDTO.put("createdAt", staff.getCreatedAt());

            return ResponseEntity.ok(staffDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error fetching staff member: " + e.getMessage()));
        }
    }

    /**
     * Update staff member status (activate/deactivate)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStaffStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User currentUserEntity = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!currentUserEntity.getUserType().equals(User.UserType.ORGANIZATION_ADMIN)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            User staff = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Staff member not found"));

            if (!currentUserEntity.getOrganization().equals(staff.getOrganization())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            Boolean isActive = request.get("isActive");
            if (isActive != null) {
                staff.setIsActive(isActive);
                userRepository.save(staff);
            }

            return ResponseEntity.ok(Map.of("message", "Staff status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error updating staff status: " + e.getMessage()));
        }
    }
}
