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
import java.util.stream.Collectors;

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

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
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

        User user = userRepository.findByIdWithOrganization(currentUser.getId()).orElse(null);

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

        User user = userRepository.findByIdWithOrganization(currentUser.getId()).orElse(null);
        Optional<ReportSummary> report = reportService.getReportById(id, user);

        if (report.isPresent()) {
            return ResponseEntity.ok(report.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Report not found");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/with-images")
    public ResponseEntity<Page<ReportSummary>> getReportsWithImages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        User user = userRepository.findByIdWithOrganization(currentUser.getId()).orElse(null);
        Page<ReportSummary> reports = reportService.getReportsWithImages(pageable, user);

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/my-reports")
    public ResponseEntity<Page<ReportSummary>> getUserReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
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

        User user = userRepository.findByIdWithOrganization(currentUser.getId()).orElse(null);
        List<ReportSummary> reports = reportService.getReportsInArea(minLat, maxLat, minLng, maxLng, user);

        return ResponseEntity.ok(reports);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteForReport(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
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

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
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

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
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

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check user authorization - organization members (staff, admin) OR volunteers can view organization reports
        boolean isAuthorized = false;
        
        // Organization staff/admin can view their organization's reports
        if (user.getOrganization() != null && user.getOrganization().getId().equals(organizationId) &&
            (user.getUserType() == User.UserType.ORGANIZATION_ADMIN || 
             user.getUserType() == User.UserType.ORGANIZATION_STAFF)) {
            isAuthorized = true;
        }
        
        // Volunteers can view reports for any organization to help with assignments
        if (user.getIsVolunteer() != null && user.getIsVolunteer() || 
            user.getUserType() == User.UserType.VOLUNTEER) {
            isAuthorized = true;
        }
        
        if (!isAuthorized) {
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

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
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

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
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
            System.out.println("=== DUPLICATE CHECK REQUEST RECEIVED ===");
            System.out.println("Raw request object: " + reportRequest);
            System.out.println("Category: " + reportRequest.getCategory());
            System.out.println("Description: " + reportRequest.getDescription());
            System.out.println("Title: " + reportRequest.getTitle());
            System.out.println("Latitude: " + reportRequest.getLatitude());
            System.out.println("Longitude: " + reportRequest.getLongitude());
            System.out.println("Priority: " + reportRequest.getPriority());
            System.out.println("Location Address: " + reportRequest.getLocationAddress());
            System.out.println("Target Org IDs: " + reportRequest.getTargetOrganizationIds());
            System.out.println("Notify Volunteers: " + reportRequest.getNotifyVolunteers());
            System.out.println("==========================================");
            
            // Create a temporary Report object for duplicate checking
            Report tempReport = new Report();
            tempReport.setCategory(reportRequest.getCategory());
            tempReport.setDescription(reportRequest.getDescription());
            tempReport.setLatitude(reportRequest.getLatitude());
            tempReport.setLongitude(reportRequest.getLongitude());

            // Check if coordinates are missing
            if (reportRequest.getLatitude() == null || reportRequest.getLongitude() == null) {
                System.out.println("WARNING: Missing latitude/longitude coordinates!");
                System.out.println("Duplicate detection requires location coordinates to work properly.");
                
                // Return empty result if no coordinates
                Map<String, Object> response = new HashMap<>();
                response.put("hasDuplicates", false);
                response.put("duplicateCount", 0);
                response.put("duplicates", new ArrayList<>());
                response.put("error", "Missing coordinates for duplicate detection");
                return ResponseEntity.ok(response);
            }

            System.out.println("Creating temp report with coordinates: " + tempReport.getLatitude() + ", " + tempReport.getLongitude());

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
            Optional<User> userOpt = userRepository.findByIdWithOrganization(currentUser.getId());
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

    /**
     * Export selected reports to PDF
     */
    @PostMapping("/export/pdf")
    public ResponseEntity<?> exportReportsToPDF(
            @RequestBody Map<String, Object> exportRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            System.out.println("PDF Export request received: " + exportRequest);
            
            User user = userRepository.findByIdWithOrganization(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Handle both Integer and Long values from JSON
            @SuppressWarnings("unchecked")
            List<Object> rawReportIds = (List<Object>) exportRequest.get("reportIds");
            @SuppressWarnings("unchecked")
            Map<String, Object> options = (Map<String, Object>) exportRequest.get("options");

            if (rawReportIds == null || rawReportIds.isEmpty()) {
                System.out.println("No report IDs provided");
                return ResponseEntity.badRequest().body(Map.of("message", "No reports selected for export"));
            }

            // Convert Integer/Long values to Long
            List<Long> reportIds = rawReportIds.stream()
                    .map(id -> {
                        if (id instanceof Integer) {
                            return ((Integer) id).longValue();
                        } else if (id instanceof Long) {
                            return (Long) id;
                        } else {
                            return Long.valueOf(id.toString());
                        }
                    })
                    .collect(Collectors.toList());

            System.out.println("Exporting reports: " + reportIds + " for user: " + user.getFullName());
            
            byte[] pdfBytes = reportService.exportReportsToPDF(reportIds, options, user);
            
            System.out.println("PDF generated successfully, size: " + pdfBytes.length + " bytes");
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header("Content-Disposition", "attachment; filename=reports_export.pdf")
                    .body(pdfBytes);
                    
        } catch (Exception e) {
            System.err.println("Error exporting reports: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error exporting reports: " + e.getMessage()));
        }
    }

    /**
     * Export single report to PDF
     */
    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<?> exportSingleReportToPDF(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean includeImages,
            @RequestParam(defaultValue = "true") boolean includeComments,
            @RequestParam(defaultValue = "true") boolean includeProgress,
            @RequestParam(defaultValue = "true") boolean includeMetadata,
            @RequestParam(defaultValue = "detailed") String format,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findByIdWithOrganization(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> options = new HashMap<>();
            options.put("includeImages", includeImages);
            options.put("includeComments", includeComments);
            options.put("includeProgress", includeProgress);
            options.put("includeMetadata", includeMetadata);
            options.put("format", format);

            byte[] pdfBytes = reportService.exportSingleReportToPDF(id, options, user);
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header("Content-Disposition", "attachment; filename=report_" + id + ".pdf")
                    .body(pdfBytes);
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error exporting report: " + e.getMessage()));
        }
    }

    /**
     * Test PDF generation endpoint
     */
    @GetMapping("/test-pdf")
    public ResponseEntity<?> testPDF(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            System.out.println("Test PDF endpoint called");
            
            // Create a simple test PDF
            String testContent = "Test PDF Content - User: " + currentUser.getUsername();
            byte[] testPdf = testContent.getBytes();
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/plain")
                    .header("Content-Disposition", "attachment; filename=test.txt")
                    .body(testPdf);
                    
        } catch (Exception e) {
            System.err.println("Error in test PDF: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Test failed: " + e.getMessage()));
        }
    }
}
