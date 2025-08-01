package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.ReportRequest;
import com.ambiguous.fixpoint.dto.ReportSummary;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.security.UserPrincipal;
import com.ambiguous.fixpoint.service.ReportService;
import com.ambiguous.fixpoint.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignReport(
            @PathVariable Long id,
            @RequestParam Long assigneeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only admins can assign reports
        if (user.getRole() != User.Role.ADMIN) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized to assign reports");
            return ResponseEntity.status(403).body(error);
        }

        try {
            ReportSummary report = reportService.assignReport(id, assigneeId, user);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
