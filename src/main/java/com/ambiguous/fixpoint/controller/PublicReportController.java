package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.ReportSummary;
import com.ambiguous.fixpoint.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicReportController {

    @Autowired
    private ReportService reportService;

    /**
     * Get all reports publicly accessible (for frontend dashboard)
     */
    @GetMapping("/reports")
    public ResponseEntity<Page<ReportSummary>> getPublicReports(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Get all reports without authentication requirement
            Page<ReportSummary> reports = reportService.getAllReports(pageable, null);
            
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.err.println("Error fetching public reports: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
