package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.ReportSummary;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/reports")
    public ResponseEntity<Page<ReportSummary>> getPublicReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ReportSummary> reports;
        if (status != null) {
            reports = reportService.getReportsByStatus(Report.Status.valueOf(status.toUpperCase()), pageable, null);
        } else if (category != null) {
            reports = reportService.getReportsByCategory(Report.Category.valueOf(category.toUpperCase()), pageable, null);
        } else {
            reports = reportService.getAllReports(pageable, null);
        }

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/resolved")
    public ResponseEntity<Page<ReportSummary>> getResolvedReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("resolvedAt").descending());
        Page<ReportSummary> reports = reportService.getReportsByStatus(Report.Status.RESOLVED, pageable, null);

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/area")
    public ResponseEntity<List<ReportSummary>> getPublicReportsInArea(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {

        List<ReportSummary> reports = reportService.getReportsInArea(minLat, maxLat, minLng, maxLng, null);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/categories")
    public ResponseEntity<Report.Category[]> getReportCategories() {
        return ResponseEntity.ok(Report.Category.values());
    }

    @GetMapping("/reports/statuses")
    public ResponseEntity<Report.Status[]> getReportStatuses() {
        return ResponseEntity.ok(Report.Status.values());
    }

    @GetMapping("/reports/priorities")
    public ResponseEntity<Report.Priority[]> getReportPriorities() {
        return ResponseEntity.ok(Report.Priority.values());
    }
}
