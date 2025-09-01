package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.ReportRequest;
import com.ambiguous.fixpoint.dto.ReportSummary;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.security.UserPrincipal;
import com.ambiguous.fixpoint.service.ReportService;
import com.ambiguous.fixpoint.service.DuplicateDetectionService;
import com.ambiguous.fixpoint.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DuplicateDetectionService duplicateDetectionService;

    @PostMapping
    public ResponseEntity<?> createReport(
            @Valid @ModelAttribute ReportRequest reportRequest,
            @RequestParam(required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            ReportSummary report = reportService.createReport(reportRequest, image, user);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<Page<ReportSummary>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        User user = userRepository.findById(currentUser.getId()).orElse(null);

        Page<ReportSummary> reports;
        if (status != null) {
            reports = reportService.getReportsByStatus(Report.Status.valueOf(status.toUpperCase()), pageable, user);
        } else if (category != null) {
            reports = reportService.getReportsByCategory(Report.Category.valueOf(category.toUpperCase()), pageable, user);
        } else {
            reports = reportService.getAllReports(pageable, user);
        }

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId()).orElse(null);
        Optional<ReportSummary> report = reportService.getReportById(id, user);

        if (report.isPresent()) {
            return ResponseEntity.ok(report.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Report not found");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my-reports")
    public ResponseEntity<Page<ReportSummary>> getUserReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReportSummary> reports = reportService.getUserReports(user, pageable);

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/area")
    public ResponseEntity<List<ReportSummary>> getReportsInArea(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId()).orElse(null);
        List<ReportSummary> reports = reportService.getReportsInArea(minLat, maxLat, minLng, maxLng, user);

        return ResponseEntity.ok(reports);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteForReport(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            ReportSummary report = reportService.voteForReport(id, user);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String resolutionNotes,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only admins and NGO staff can update status
        if (user.getRole() == User.Role.CITIZEN) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized to update report status");
            return ResponseEntity.status(403).body(error);
        }

        try {
            ReportSummary report = reportService.updateReportStatus(id, 
                    Report.Status.valueOf(status.toUpperCase()), resolutionNotes, user);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/assigned")
    public ResponseEntity<?> getAssignedReports(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ReportSummary> reports = reportService.getReportsAssignedToUser(user.getId(), pageable);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<?> getOrganizationReports(
            @PathVariable Long organizationId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only organization admin/staff can access their organization's reports
        if (!user.getOrganization().getId().equals(organizationId) || 
            (user.getUserType() != User.UserType.ORGANIZATION_ADMIN && 
             user.getUserType() != User.UserType.ORGANIZATION_STAFF)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized to access organization reports");
            return ResponseEntity.status(403).body(error);
        }

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ReportSummary> reports = reportService.getReportsByTargetOrganization(organizationId, pageable);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/assign-staff")
    public ResponseEntity<?> assignReportToStaff(
            @PathVariable Long id,
            @RequestBody Map<String, Long> requestBody,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only organization admins can assign reports
        if (user.getUserType() != User.UserType.ORGANIZATION_ADMIN) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized to assign reports");
            return ResponseEntity.status(403).body(error);
        }

        try {
            Long assignedToId = requestBody.get("assignedToId");
            ReportSummary report = reportService.assignReport(id, assignedToId, user);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignReport(
            @PathVariable Long id,
            @RequestBody Map<String, Long> requestBody,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Long assignedToId = requestBody.get("assignedToId");
            
            // Check if the current user is trying to assign to themselves (volunteer self-assignment)
            if (assignedToId.equals(currentUser.getId())) {
                // Allow volunteers to self-assign
                if (user.getIsVolunteer() || user.getUserType() == User.UserType.VOLUNTEER) {
                    ReportSummary report = reportService.assignReport(id, assignedToId, user);
                    return ResponseEntity.ok(report);
                }
            }
            
            // For other assignments, check if user is admin or staff
            if (user.getUserType() == User.UserType.ORGANIZATION_ADMIN || 
                user.getUserType() == User.UserType.ORGANIZATION_STAFF) {
                ReportSummary report = reportService.assignReport(id, assignedToId, user);
                return ResponseEntity.ok(report);
            }
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized to assign reports");
            return ResponseEntity.status(403).body(error);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/check-duplicates")
    public ResponseEntity<?> checkDuplicates(@RequestBody ReportRequest reportRequest) {
        try {
            // Create a temporary Report object for duplicate checking
            Report tempReport = new Report();
            tempReport.setCategory(reportRequest.getCategory());
            tempReport.setDescription(reportRequest.getDescription());
            tempReport.setLatitude(reportRequest.getLatitude());
            tempReport.setLongitude(reportRequest.getLongitude());

            // Find potential duplicates
            List<DuplicateDetectionService.DuplicateResult> duplicates = 
                duplicateDetectionService.findRankedDuplicates(tempReport);

            System.out.println("Found " + duplicates.size() + " total duplicates");

            Map<String, Object> response = new HashMap<>();
            response.put("hasDuplicates", !duplicates.isEmpty());
            response.put("duplicateCount", duplicates.size());
            
            // Simplified duplicate info to avoid circular references
            List<Map<String, Object>> duplicateList = new ArrayList<>();
            for (DuplicateDetectionService.DuplicateResult duplicate : duplicates) {
                if (duplicateList.size() >= 5) break; // Limit to 5 duplicates
                
                Map<String, Object> duplicateInfo = new HashMap<>();
                Report report = duplicate.getReport();
                
                duplicateInfo.put("id", report.getId());
                duplicateInfo.put("title", report.getTitle());
                duplicateInfo.put("description", report.getDescription());
                duplicateInfo.put("category", report.getCategory().toString());
                duplicateInfo.put("status", report.getStatus().toString());
                duplicateInfo.put("createdAt", report.getCreatedAt().toString());
                duplicateInfo.put("similarity", Math.round(duplicate.getScore() * 100));
                
                // Safely get reporter name without circular references
                try {
                    String reporterName = "Unknown Reporter";
                    if (report.getReporter() != null) {
                        reporterName = report.getReporter().getFullName();
                    }
                    duplicateInfo.put("reporter", reporterName);
                } catch (Exception e) {
                    duplicateInfo.put("reporter", "Unknown Reporter");
                    System.out.println("Error getting reporter: " + e.getMessage());
                }
                
                duplicateList.add(duplicateInfo);
            }
            
            response.put("duplicates", duplicateList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error checking for duplicates: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update progress for a report (for assigned employees)
     */
    @PutMapping("/{id}/progress")
    public ResponseEntity<?> updateReportProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Object> progressData,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Optional<User> userOpt = userRepository.findById(currentUser.getId());
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            
            Integer progressPercentage = (Integer) progressData.get("progressPercentage");
            String progressNotes = (String) progressData.get("progressNotes");
            String workStage = (String) progressData.get("workStage");

            ReportSummary updatedReport = reportService.updateProgress(id, progressPercentage, progressNotes, workStage, user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Progress updated successfully",
                "report", updatedReport
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error updating progress: " + e.getMessage()));
        }
    }

    /**
     * Get reports assigned to the current user
     */
    @GetMapping("/assigned/me")
    public ResponseEntity<?> getMyAssignedReports(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ReportSummary> reports = reportService.getAssignedReports(currentUser.getId(), pageable);
            
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error fetching assigned reports: " + e.getMessage()));
        }
    }
}
